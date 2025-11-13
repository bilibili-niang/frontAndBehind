/** 查询匹配规则字典 */
export enum QueryDic {
  /** 等于 */
  EQUAL = 'equal',
  /** 不等于 */
  NOT_EQUAL = 'notequal',
  /** 模糊匹配 */
  LIKE = 'like',
  LIKE_LEFT = 'likeleft',
  LIKE_RIGHT = 'likeright',
  NOT_LIKE = 'notlike',
  GE = 'ge',
  GT = 'gt',
  LE = 'le',
  LT = 'lt',
  DATE_GE = 'datege',
  DATE_GT = 'dategt',
  DATE_LE = 'datele',
  DATE_LT = 'datelt',
  IS_NULL = 'null',
  NOT_NULL = 'notnull',
  IGNORE = 'ignore'
}

export const QueryFunction = {
  EQUAL: { label: '等于', value: QueryDic.EQUAL },
  NOT_EQUAL: { label: '不等于', value: QueryDic.NOT_EQUAL },
  LIKE: { label: '模糊匹配', value: QueryDic.LIKE },
  LIKE_LEFT: { label: '左模糊匹配', value: QueryDic.LIKE_LEFT },
  LIKE_RIGHT: { label: '右模糊匹配', value: QueryDic.LIKE_RIGHT },
  // NOT_LIKE: { label: '不模糊匹配', value: QueryDic.NOT_LIKE },
  GE: { label: '大于等于', value: QueryDic.GE },
  GT: { label: '大于', value: QueryDic.GT },
  LE: { label: '小于等于', value: QueryDic.LE },
  LT: { label: '小于', value: QueryDic.LT },
  DATE_GE: { label: '时间大于等于', value: QueryDic.DATE_GE },
  DATE_GT: { label: '时间大于', value: QueryDic.DATE_GT },
  DATE_LE: { label: '时间小于等于', value: QueryDic.DATE_LE },
  DATE_LT: { label: '时间小于', value: QueryDic.DATE_LT },
  IS_NULL: { label: '无值', value: QueryDic.IS_NULL },
  NOT_NULL: { label: '有值', value: QueryDic.NOT_NULL }
  // IGNORE: { label: '忽略', value: QueryDic.IGNORE }
}

const CONSTANTS = {
  /** 默认字体样式，当无法获取实际表格单元格字体时使用 */
  DEFAULT_FONT: '15px Microsoft YaHei',
  /** 特殊宽度值，用于标记需要动态计算宽度的列 */
  SPECIAL_WIDTH: 121.333,
  /** 默认列宽，当计算结果为0时使用此值 */
  DEFAULT_COLUMN_WIDTH: 170,
  /** 时间戳列（createTime/updateTime）的固定宽度 */
  TIMESTAMP_COLUMN_WIDTH: 170,
  /** 方差阈值，用于判断是否使用平均值计算列宽 */
  VARIANCE_THRESHOLD: 200,
  /** 文本内容的padding比例，最终宽度会乘以此值留出余量 */
  TEXT_PADDING_RATIO: 1.07
} as const

// 1. 缓存字体样式的获取结果
let cachedFont: string | null = null

function getTableCellFont(): string {
  if (cachedFont) return cachedFont

  const element = document.querySelector('.anteng-table-cell')
  if (!element) {
    console.warn('未找到 .anteng-table-cell 元素，使用默认字体样式')
    return CONSTANTS.DEFAULT_FONT
  }

  const computedStyle = window.getComputedStyle(element)
  cachedFont = `${computedStyle.fontSize} ${computedStyle.fontFamily}`
  return cachedFont
}

// 避免重复创建canvas
const textWidthCalculator = (() => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('无法获取 Canvas 2D context')
  }

  // 获取实际使用的字体样式
  const actualFont = getTableCellFont()

  return {
    getWidthByText: (text: string, font = actualFont) => {
      context.font = font
      const textmetrics = context.measureText(text)
      return textmetrics.width
    }
  }
})()

// 2. 添加文本宽度计算的缓存
const widthCache = new Map<string, number>()

function getWidthByText(text: string, font?: string): number {
  if (typeof text !== 'string') {
    console.warn('getWidthByText: 输入必须是字符串类型')
    return 0
  }

  const cacheKey = `${text}-${font}`
  if (widthCache.has(cacheKey)) {
    return widthCache.get(cacheKey)!
  }

  try {
    const width = textWidthCalculator.getWidthByText(text, font)
    widthCache.set(cacheKey, width)
    return width
  } catch (error) {
    console.error('计算文本宽度时发生错误:', error)
    return 0
  }
}

function dynamicN(lengths: number[]): number {
  if (lengths.length === 0) return 1

  const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length
  const stdDev = Math.sqrt(lengths.reduce((sq, x) => sq + Math.pow(x - avgLength, 2), 0) / lengths.length)
  const threshold = avgLength + stdDev
  const n = lengths.filter((length) => length > threshold).length

  return Math.max(1, n)
}

//求数组方差
function varianceArr(array: any[]) {
  const arr = array.filter((i) => i)
  if (arr.length === 0) {
    return 0
  } else {
    let ave = 0
    const len = arr.length
    let sum = 0
    let sums = 0

    for (let i = 0; i < len; i++) {
      sum += Number(arr[i])
    }
    ave = sum / len
    for (let i = 0; i < len; i++) {
      sums += (Number(arr[i]) - ave) * (Number(arr[i]) - ave)
    }
    // 直接返回数字而不是字符串
    return Math.round(sums / len)
  }
}

// 添加以下接口定义
interface TableColumn {
  dataIndex?: string
  width?: number
  fixed?: 'left' | 'right' | boolean

  [key: string]: any
}

/*
 * 根据当前每列字数的平均值生成列宽,只有没有指定width的列,才会计算出宽度,如果指定了,则不会计算
 * 部分特殊列会强制使用指定宽度
 * */
export const getColumnWidth = (column: TableColumn[], dataSource: Record<string, any>[]) => {
  const specialWidth = CONSTANTS.SPECIAL_WIDTH

  // 预先计算所有文本的宽度
  const textWidthMap = new Map<string, number>()

  // 已填充指定宽度的数组
  const fillWidthColumn = column.map((i: TableColumn) => {
    const col = { ...i } // 避免直接修改入参
    if (!col.width) {
      col.width = specialWidth
    }
    return col
  })

  fillWidthColumn.forEach((item: TableColumn, index) => {
    if (item.width !== specialWidth) return // 跳过已有固定宽度的列
    if (item.dataIndex === 'createTime' || item.dataIndex === 'updateTime') {
      item.width = CONSTANTS.TIMESTAMP_COLUMN_WIDTH
      return
    }

    // 获取当前列的标题,列宽至少不能小于标题的宽度,否则标题会被压缩换行
    const titleWidth = getWidthByText(column[index]?.title || '我是标题文字')

    const columnTexts = dataSource
      .map((o) => o[item.dataIndex])
      .filter(Boolean)
      .map((text) => {
        const key = `${text}`
        if (!textWidthMap.has(key)) {
          const columnWidth = Math.round(getWidthByText(text)) || 70
          textWidthMap.set(key, columnWidth < titleWidth ? titleWidth : columnWidth)
        }
        return textWidthMap.get(key)!
      })

    if (columnTexts.length === 0) {
      item.width = CONSTANTS.DEFAULT_COLUMN_WIDTH
      return
    }

    const variance = varianceArr(columnTexts)

    if (variance < CONSTANTS.VARIANCE_THRESHOLD) {
      // 方差小，使用平均值
      const totalWidth = columnTexts.reduce((sum, width) => sum + width, 0)
      item.width =
        Math.round((totalWidth / columnTexts.length) * CONSTANTS.TEXT_PADDING_RATIO) || CONSTANTS.DEFAULT_COLUMN_WIDTH
    } else {
      // 方差大，使用最长的几个值的平均
      const sortedWidths = [...columnTexts].sort((a, b) => b - a)
      const n = dynamicN(sortedWidths)
      const avgWidth = sortedWidths.slice(0, n).reduce((sum, width) => sum + width, 0) / n
      item.width = Math.round(avgWidth * CONSTANTS.TEXT_PADDING_RATIO)
    }
  })

  return fillWidthColumn
}
