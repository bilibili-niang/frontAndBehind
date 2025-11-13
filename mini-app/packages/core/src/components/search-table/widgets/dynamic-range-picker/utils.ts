import dayjs, { type Dayjs } from 'dayjs'

const DATE_FORMAT = 'YYYY-MM-DD'
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'
export const DEFAULT_START_TIME = '00:00:00'
export const DEFAULT_END_TIME = '23:59:59'

const getPastNRange = (date: dayjs.Dayjs, n: number) => {
  const start = dayjs(date).subtract(n, 'day').startOf('day')
  const end = dayjs(date).subtract(1, 'day').endOf('day')
  return [start, end]
}

const getFutureNRange = (date: dayjs.Dayjs, n: number) => {
  const start = dayjs(date).add(1, 'day').startOf('day')
  const end = dayjs(date).add(n, 'day').endOf('day')
  return [start, end]
}

export enum DynamicDateMode {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  TOMORROW = 'tomorrow',
  STATIC = 'static',
  PAST = 'past',
  FUTURE = 'future'
}

export type DynamicDefine = {
  mode: DynamicDateMode
  n?: number
  date?: Dayjs
  time?: string
}

export type DynamicDateShortcutsOptions = {
  referenceTime?: Dayjs
  start: DynamicDefine
  end: DynamicDefine
}

export const DynamicDateShortcuts = [
  {
    title: '今日',
    key: DynamicDateMode.TODAY,
    getValue(options: DynamicDateShortcutsOptions) {
      return [dayjs(options.referenceTime).startOf('day'), dayjs(options.referenceTime).endOf('day')]
    }
  },
  {
    title: '昨日',
    key: DynamicDateMode.YESTERDAY,
    getValue(options: DynamicDateShortcutsOptions) {
      return [
        dayjs(options.referenceTime).subtract(1, 'day').startOf('day'),
        dayjs(options.referenceTime).subtract(1, 'day').endOf('day')
      ]
    }
  },
  {
    title: '明日',
    key: DynamicDateMode.TOMORROW,
    getValue(options: DynamicDateShortcutsOptions) {
      return [
        dayjs(options.referenceTime).add(1, 'day').startOf('day'),
        dayjs(options.referenceTime).add(1, 'day').endOf('day')
      ]
    }
  },
  {
    title: '本周',
    key: 'this_week',
    getValue(options: DynamicDateShortcutsOptions) {
      return [dayjs(options.referenceTime).startOf('week'), dayjs(options.referenceTime).endOf('week')]
    }
  },
  {
    title: '上周',
    key: 'last_week',
    getValue(options: DynamicDateShortcutsOptions) {
      return [
        dayjs(options.referenceTime).subtract(1, 'week').startOf('week'),
        dayjs(options.referenceTime).subtract(1, 'week').endOf('week')
      ]
    }
  },
  {
    title: '本月',
    key: 'this_month',
    getValue(options: DynamicDateShortcutsOptions) {
      return [dayjs(options.referenceTime).startOf('month'), dayjs(options.referenceTime).endOf('month')]
    }
  },
  {
    title: '上月',
    key: 'last_month',
    getValue(options: DynamicDateShortcutsOptions) {
      return [
        dayjs(options.referenceTime).subtract(1, 'month').startOf('month'),
        dayjs(options.referenceTime).subtract(1, 'month').endOf('month')
      ]
    }
  },
  {
    title: '今年',
    key: 'this_year',
    getValue(options: DynamicDateShortcutsOptions) {
      return [dayjs(options.referenceTime).startOf('year'), dayjs(options.referenceTime).endOf('year')]
    }
  },
  {
    title: '去年',
    key: 'last_year',
    hidden: true,
    getValue(options: DynamicDateShortcutsOptions) {
      return [
        dayjs(options.referenceTime).subtract(1, 'year').startOf('year'),
        dayjs(options.referenceTime).subtract(1, 'year').endOf('year')
      ]
    }
  },
  {
    title: '过去 7 天',
    key: 'past_7',
    getValue(options: DynamicDateShortcutsOptions) {
      return getPastNRange(dayjs(options.referenceTime), 7)
    }
  },
  {
    title: '过去 14 天',
    key: 'past_14',
    getValue(options: DynamicDateShortcutsOptions) {
      return getPastNRange(dayjs(options.referenceTime), 14)
    }
  },
  {
    title: '过去 30 天',
    key: 'past_30',
    hidden: true,
    getValue(options: DynamicDateShortcutsOptions) {
      return getPastNRange(dayjs(options.referenceTime), 30)
    }
  },
  {
    title: '过去 90 天',
    key: 'past_90',
    hidden: true,
    getValue(options: DynamicDateShortcutsOptions) {
      return getPastNRange(dayjs(options.referenceTime), 90)
    }
  },
  {
    title: '未来 7 天',
    key: 'future_7',
    getValue(options: DynamicDateShortcutsOptions) {
      return getFutureNRange(dayjs(options.referenceTime), 7)
    }
  },
  {
    title: '未来 14 天',
    key: 'future_14',
    getValue(options?: DynamicDateShortcutsOptions) {
      return getFutureNRange(dayjs(options?.referenceTime), 14)
    }
  },
  {
    title: '过去',
    key: 'past',
    getValue(options: DynamicDateShortcutsOptions) {
      const { start, end } = options || {}
      return [getRelativeDate(start!, options?.referenceTime), getRelativeDate(end!, options?.referenceTime)]
    }
  },
  {
    title: '未来',
    key: 'future',
    getValue(options: DynamicDateShortcutsOptions) {
      const { start, end } = options || {}
      return [getRelativeDate(start!, options?.referenceTime), getRelativeDate(end!, options?.referenceTime)]
    }
  },
  {
    title: '静态',
    key: undefined,
    getValue(options: DynamicDateShortcutsOptions) {
      const { start, end } = options || {}
      return [dayjs(start.date).startOf('day'), dayjs(end.date).endOf('day')]
    }
  },
  {
    title: '自定义',
    key: 'custom',
    // stretch: true,
    hidden: true,
    getValue(options: DynamicDateShortcutsOptions) {
      const { start, end } = options || {}
      return [getRelativeDate(start!, options?.referenceTime), getRelativeDate(end!, options?.referenceTime)]
    }
  }
]

/** 获取相对日期 */
const getRelativeDate = (options: DynamicDefine, referenceTime?: Dayjs): Dayjs | undefined => {
  const { mode } = options

  if (mode === DynamicDateMode.STATIC) {
    // 静态时间直接返回
    return dayjs(options.date)
  }

  const _referenceTime = dayjs(referenceTime)

  if (mode === DynamicDateMode.TODAY) {
    return _referenceTime.startOf('day')
  }

  if (mode === DynamicDateMode.YESTERDAY) {
    return _referenceTime.subtract(1, 'day').startOf('day')
  }

  if (mode === DynamicDateMode.TOMORROW) {
    return _referenceTime.add(1, 'day').startOf('day')
  }

  if (mode === DynamicDateMode.PAST) {
    return _referenceTime.subtract(options.n, 'day').startOf('day')
  }

  if (mode === DynamicDateMode.FUTURE) {
    return _referenceTime.add(options.n, 'day').startOf('day')
  }

  return undefined
}

type Parts = {
  s1: string
  s2?: string
  refTime?: string // YYYY-MM-DD
  startTime: string // HH:mm:ss (默认 "00:00:00")
  endTime: string // HH:mm:ss (默认 "23:59:59")
}

/**
 * 提取 5 个字段：s1, s2, refTime (YYYY-MM-DD), startTime, endTime
 * 若 time 区间不存在，会返回默认时间。
 * 若匹配失败，返回 null。
 */
function extractFiveParts(expr: string): Parts | null {
  const _expr = Array.isArray(expr) ? expr.join(',') : expr

  const regex =
    /^\s*([^,()[\]]+)(?:,([^()[\]]+))?(?:\((\d{4}-\d{2}-\d{2})\))?(?:\[(\d{2}:\d{2}:\d{2}),(\d{2}:\d{2}:\d{2})\])?\s*$/

  // 去除所有空格后再匹配
  const m = _expr?.replace(/\s+/g, '').match(regex)

  if (!m) return null

  const [, s1, s2, refTime, t1, t2] = m
  return {
    s1: s1,
    s2: s2 || undefined,
    refTime: refTime || dayjs().format('YYYY-MM-DD'),
    startTime: t1 || '00:00:00',
    endTime: t2 || '23:59:59'
  }
}

const isPastN = (s1: string) => {
  return s1?.startsWith('past_') && !Number.isNaN(Number(s1.match(/^past_(\d+)$/)?.[1]))
}

const isFutureN = (s1: string) => {
  return s1?.startsWith('future_') && !Number.isNaN(Number(s1.match(/^future_(\d+)$/)?.[1]))
}

const isStaticDate = (s1: string) => {
  return /^(\d{4}-\d{2}-\d{2})$/.test(s1)
}

const getN = (s1: string) => {
  return Number(s1.match(/^(past|future)_(\d+)$/)?.[2])
}

const parse = (expr: string) => {
  const res = retrieve(expr)
  if (!res) return []

  const { start, end, referenceTime, currentShortcut } = res
  if (!currentShortcut) {
    return [start.date, end.date]
  }

  const s = DynamicDateShortcuts.find((item) => item.key === currentShortcut)
  if (s) {
    return s.getValue({ start, end, referenceTime })
  }

  return [start.date, end.date]
}

export const parseDynamicDateRange = (expr: string) => {
  return parse(expr)?.map((item) => item?.format('YYYY-MM-DD HH:mm:ss'))
}

/** 从表达式中解析出动态日期范围对象 */
export const retrieve = (expr: string) => {
  const parts = extractFiveParts(expr)
  if (!parts) return null

  const { s1, s2, refTime, startTime, endTime } = parts

  const data: {
    start: DynamicDefine
    end: DynamicDefine
    referenceTime: Dayjs
    currentShortcut?: string
  } = {
    start: {
      mode: DynamicDateMode.STATIC,
      date: undefined,
      time: startTime, // 时间和日期无关，直接赋值
      n: undefined
    },
    end: {
      mode: DynamicDateMode.STATIC,
      date: undefined,
      time: endTime, // 时间和日期无关，直接赋值
      n: undefined
    },
    referenceTime: dayjs(),
    currentShortcut: undefined
  }

  if (isStaticDate(s1)) {
    data.start.date = dayjs(s1)
    if (!s2) {
      // 静态同一天，省略 s2，此时要还原，如 2025-10-01[12:00:00,20:00:00]
      data.end.date = dayjs(s1)
    }
  }

  if (isStaticDate(s2!)) {
    data.end.date = dayjs(s2)
  }

  // 解析 s1 (即 start)
  if (isPastN(s1)) {
    data.start.n = getN(s1)
    data.start.mode = DynamicDateMode.PAST
  } else if (isFutureN(s1)) {
    data.start.n = getN(s1)
    data.start.mode = DynamicDateMode.FUTURE
  } else {
    const t = DynamicDateShortcuts.find((item) => item.key === s1!)
    if (t) {
      data.start.mode = t.key as DynamicDateMode
    } else if (isPastN(s1)) {
      data.start.mode = DynamicDateMode.PAST
      data.start.n = getN(s1)
    } else if (isFutureN(s1)) {
      data.start.mode = DynamicDateMode.FUTURE
      data.start.n = getN(s1)
    }
  }

  // 解析 s1 (即 end)
  if (isPastN(s2!)) {
    data.end.n = getN(s2!)
    data.end.mode = DynamicDateMode.PAST
  } else if (isFutureN(s2!)) {
    data.end.n = getN(s2!)
    data.end.mode = DynamicDateMode.FUTURE
  } else if (s2) {
    const t = DynamicDateShortcuts.find((item) => item.key === s2!)
    if (t) {
      data.end.mode = t.key as DynamicDateMode
    }
  }

  // 判断 currentShortcut (即当前选中的快捷模式)
  if (s1 && !s2) {
    const t = DynamicDateShortcuts.find((item) => item.key === s1!)
    if (t) {
      data.currentShortcut = t.key as DynamicDateMode
    } else {
      // 非快捷模式，判断是否为 past_n 或 future_n
      if (isPastN(s1)) {
        data.currentShortcut = DynamicDateMode.PAST
        data.start.n = getN(s1)
        data.start.mode = DynamicDateMode.PAST
        data.end.mode = DynamicDateMode.YESTERDAY
      } else if (isFutureN(s1)) {
        data.currentShortcut = DynamicDateMode.FUTURE
        data.end.n = getN(s1)
        data.end.mode = DynamicDateMode.FUTURE
        data.start.mode = DynamicDateMode.TOMORROW
      }
    }
  } else if (isStaticDate(s1) && isStaticDate(s2!)) {
    data.currentShortcut = undefined
  } else if (
    (isStaticDate(s1) || isPastN(s1)) &&
    ([DynamicDateMode.YESTERDAY, DynamicDateMode.TODAY].includes(s2! as DynamicDateMode) || isPastN(s2!))
  ) {
    data.currentShortcut = 'past'
  } else if (
    (isStaticDate(s2!) || isFutureN(s2!)) &&
    ([DynamicDateMode.TODAY, DynamicDateMode.TOMORROW].includes(s1 as DynamicDateMode) || isFutureN(s1))
  ) {
    data.currentShortcut = 'future'
  } else {
    data.currentShortcut = 'custom'
  }

  // console.log(`parse：${expr}`, parts)
  // console.log('parse：', data)
  // console.log('parse--------------------------------')

  // FIXME 临时方案，加入时间设定后要删除
  data.end.date = dayjs(data.end.date).endOf('day')

  return data
}

// parseDynamicDateRange('past_7')
// parseDynamicDateRange('this_month')
// parseDynamicDateRange('yesterday[08:30:00,12:00:00]')
// parseDynamicDateRange('past_3(2025-01-01)[08:30:00, 12:00:00]')
// parseDynamicDateRange('2025-01-01,today(2025-10-03)[08:30:00,12:00:00]')
// parseDynamicDateRange('2025-01-01,yesterday(2025-10-03)')
// parseDynamicDateRange('2025-01-01,past_2(2025-10-03)')
// parseDynamicDateRange('2025-01-01,2025-01-10')
// parseDynamicDateRange('past_3,future_5[12:00:00,18:00:00]')

// s1(,s2)(\(YYYY-MM-DD\))([HH:mm:ss,HH:mm:ss])

// 静态模式：s1、s2 都符合 YYYY-MM-DD 格式
// 快捷模式：仅 s1，无 s2，如 today、tomorrow、yesterday、this_week、this_month、last_month 等等
// 自定义过去： （具体日期|过去 n1 天）~ （今天|昨天|过去 n2 天） 且 n1 >= n2
// 自定义未来： （今天|明天|未来 n1 天）~ （具体日期|未来 n2 天） 且 n1 <= n2
// 自定义模式： 以上三种模式结合，必须有 s1、s2，且如果符合以上三种，优先命中，都不能命中再转化为自定义模式

// 注意：过去 n 天，是从今天(不含)往前推 n 天；未来 n 天，是从今天(不含)往后推 n 天。
// 即：过去 2 天 = 前天~昨天，未来 1 天 = 明天，如需包含可以使用自定义

// s1(,s2)([HH:mm:ss,HH:mm:ss])(|YYYY-MM-DD)
