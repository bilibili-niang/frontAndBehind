import { PaginationData, RequestPagination, ResponseData } from '@anteng/core'
import { IGroupGoods } from './group'
import Mock from 'mockjs'
import {buildImgUrl} from '../../utils'

const { Random } = Mock


/**
 * 商品导航类目
 */
export interface IGoodsCategory {
  /**
   * 子类目列表
   */
  childCategories: IGoodsCategory[]
  /**
   * 创建时间
   */
  createTime: string
  /**
   * 创建用户
   */
  createUser: string
  /**
   * 关联的商品类目id列表
   */
  goodsCategoryIds: string[]
  /**
   * 关联的商品id列表
   */
  goodsIds: string[]
  /**
   * 类目图标
   */
  icon: string
  /**
   * 类目id
   */
  id: string
  /**
   * 是否删除
   */
  isDeleted: number
  /**
   * 合作商id
   */
  merchantId: string
  /**
   * 类目名称
   */
  name: string
  /**
   * 父级id -1为没有父级
   */
  parentId: number

  /** 层级，1 开始 */
  level: number
  /**
   * 排序权重
   */
  sort: number
  /**
   * 类目状态
   */
  status: number
  /**
   * 租户id
   */
  tenantId: string
  /**
   * 类目类型，1-关联商品 2-关联类目 3-跳转链接
   */
  type: number
  /**
   * 更新时间
   */
  updateTime: string
  /**
   * 更新用户
   */
  updateUser: string
  /**
   * 跳转地址
   */
  url: string

  [property: string]: any
}

/** 获取商品分类数据 */
export const requestGetGoodsCategories = (params?: any): Promise<ResponseData<IGoodsCategory[]>> => {
  // 基于页面实际使用字段构建：id、name、icon、childCategories、type、url、level
  const now = new Date().toISOString()
  const makeCate = (
    id: string,
    name: string,
    level: number,
    options: Partial<IGoodsCategory> = {}
  ): IGoodsCategory => {
    return {
      id,
      name,
      icon: options.icon ?? '',
      childCategories: options.childCategories ?? [],
      type: options.type ?? 1,
      url: options.url ?? '',
      level,
      // 以下为占位字段，满足类型要求
      createTime: now,
      createUser: 'mock',
      goodsCategoryIds: [],
      goodsIds: [],
      isDeleted: 0,
      merchantId: 'mock-merchant',
      parentId: level === 1 ? -1 : 0,
      sort: 0,
      status: 1,
      tenantId: 'mock-tenant',
      updateTime: now,
      updateUser: 'mock'
    }
  }

  // 生成更多二级/三级类目
  const createThird = (prefix: string, names: string[]) => names.map((n, i) => makeCate(`${prefix}-${i + 1}`, n, 3))
  const withIcon = (_text: string) => buildImgUrl()

  // 居家生活（12个二级）
  const homeLevel2Names = ['日用百货', '家居装饰', '厨房用品', '清洁收纳', '床品软装', '灯饰照明', '家居工具', '卫浴用品', '收纳整理', '生活电器', '窗帘地毯', '花艺绿植']
  const homeLevel2 = homeLevel2Names.map((name, idx) => {
    const id = `b-home-${idx + 1}`
    const third = createThird(`c-home-${idx + 1}`, ['热门', '精选', '特惠'])
    return makeCate(id, name, 2, { icon: withIcon(name), childCategories: third })
  })

  // 舌尖美味（12个二级）
  const foodLevel2Names = ['零食小吃', '饮品甜点', '生鲜水果', '烘焙糕点', '速食方便', '茶酒冲调', '休闲坚果', '海鲜水产', '肉类卤味', '特色小吃', '网红甜品', '健康轻食']
  const foodLevel2 = foodLevel2Names.map((name, idx) => {
    const id = `b-food-${idx + 1}`
    const third = createThird(`c-food-${idx + 1}`, ['人气', '新品', '限时'])
    return makeCate(id, name, 2, { icon: withIcon(name), childCategories: third })
  })

  // 休闲出游（12个二级）
  const travelLevel2Names = ['周边游玩', '门票卡券', '酒店民宿', '景点门票', '亲子乐园', '主题乐园', '露营户外', '自驾租车', '当地美食', '文化展览', '水上乐园', '温泉度假']
  const travelLevel2 = travelLevel2Names.map((name, idx) => {
    const id = `b-travel-${idx + 1}`
    const third = createThird(`c-travel-${idx + 1}`, ['必玩', '精选', '优惠'])
    return makeCate(id, name, 2, { icon: withIcon(name), childCategories: third })
  })

  // 二级动作类目（演示 type=3）
  const cateAction = makeCate('b-action', '发现好物', 2, {
    type: 3,
    url: JSON.stringify({ action: 'navigate', url: '/packageMain/index' }),
    childCategories: []
  })

  // 顶级类目
  const topCategories: IGoodsCategory[] = [
    makeCate('a-home', '居家生活', 1, { icon: withIcon('HOME'), childCategories: homeLevel2 }),
    makeCate('a-food', '舌尖美味', 1, { icon: withIcon('FOOD'), childCategories: foodLevel2 }),
    makeCate('a-travel', '休闲出游', 1, { icon: withIcon('TRAVEL'), childCategories: [...travelLevel2, cateAction] })
  ]

  return new Promise(resolve => {
    resolve({
      code: 200,
      success: true,
      data: topCategories,
      msg: 'ok'
    })
  })
}

export const requestGetGoodsCategoryGoods = (
  options: RequestPagination<{
    id: string
  }>,
  cancelToken?: any
): Promise<{
  code: number
  success: boolean
  data: PaginationData<IGroupGoods>
  msg: string
}> => {
  const { id, current = 1, size = 10 } = options

  const toPrice = (n: number) => (n * 10).toFixed(2)
  // 使用 mockjs 生成更贴近中文电商风格的商品名
  const adjectives = ['手作', '精品', '智能', '轻奢', '有机', '原味', '限量', '经典', '便携', '家庭装', '儿童款', '旅行版', '精选', '高山', '现烘', '低糖', '全麦', '无添加']
  const nouns = ['咖啡豆', '曲奇礼盒', '保温杯', '羽绒服', '跑步鞋', '牛奶', '酸奶', '果干', '坚果', '面包', '花茶', '红茶', '绿茶', '拖鞋', '沐浴露', '洗发水', '牙刷', '牙膏', '小夜灯', '收纳盒', '雨衣', '雨伞', '运动水壶', '冲锋衣', '露营帐篷', '便携充电器', '蓝牙耳机', '香薰蜡烛', '挂烫机', '不粘锅', '煎锅', '刀具套装', '微波饭盒', '保鲜袋', '抹布', '拖把']
  const genProductName = () => `${Random.pick(adjectives)}${Random.pick(nouns)}`
  const makeGoods = (idx: number): IGroupGoods => {
    const gid = `${id}-g-${current}-${idx}`
    return {
      id: gid,
      title: genProductName(),
      type: 1,
      code: `CODE-${gid}`,
      coverImages: [buildImgUrl()],
      sort: idx,
      status: 1,
      priceMin: toPrice(9 + idx),
      priceMax: toPrice(19 + idx),
      underlinePrice: toPrice(29 + idx)
    }
  }

  const total = 24
  const pages = Math.ceil(total / size)
  const records = Array.from({ length: Math.min(size, total - (current - 1) * size) }, (_, i) =>
    makeGoods(i + 1 + (current - 1) * size)
  )

  return new Promise(resolve => {
    resolve({
      code: 200,
      success: true,
      data: {
        countId: '',
        current,
        maxLimit: 0,
        optimizeCountSql: true,
        orders: [],
        pages,
        records,
        searchCount: true,
        size,
        total
      },
      msg: 'ok'
    })
  })
}
