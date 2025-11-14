import { type SkuItem } from '../../hooks/useGoodsSku/utils'

export interface IGoodsDetail {
  /* 
  商品限售类型 
  0 仅所选区域可以下单
  1
  */
  restrictedType: 0 | 1
  /* 
  商品限售标志,1 不限售 1 限售
  */
  restrictedStatus: 0 | 1
  /*
  商品限制销售的区域代码
  卡券商品该字段不存在或为null
  */
  restrictedArea?: string[][]
  /** 需要提前购买天数 */
  aheadDays: number
  /** 允许分享 */
  allowShare: number
  /** 可使用时间 */
  availableDate: number
  /** 指定时间可用结束日期时间 */
  availableDateEndAt: string
  /** 指定时间可用开始日期时间 */
  availableDateStartAt: string
  /** 可使用次数 */
  availableTimes: number
  /** 商品基础属性id */
  basicDescAttributeIds: { [key: string]: any }
  /** 商品基础属性 */
  basicDescAttributeJson: { [key: string]: any }
  /** 商品品牌ID */
  brandId: number
  /** 当天可购买结束时间 */
  buyEndAt: string
  /** 当天可购买开始时间 */
  buyStartAt: string
  /** 是否可退 */
  canRefund: number
  /** 商品类目 */
  categoryIds: string[]
  /** 商品编码 */
  code: string
  /** 商品主图 */
  coverImages: string[]
  /** 商品详情富文本内容 */
  detail: string
  /** 下单后x天内有效值 */
  expireDays: number
  /** 制定有效期结束日期时间 */
  expireEndAt: string
  /** 过期处理方式 */
  expireProcess: number
  /** 指定有效期开始日期时间 */
  expireStartAt: string
  /** 有效期类型 */
  expireType: number
  /** 费用说明详情单 */
  feeList: { [key: string]: any }
  /** 关联运费模板ID */
  freightTemplate: {
    basicFee: any
    freeDistrict: any
    id: string
    name: string
    shippingDistrict: { code: string; value: string }[]
    type: number
  }
  /** 商品SKU */
  goodsSkus: SkuItem[]
  groupId: number
  /** 商品ID */
  id: string
  /** 限购依据 */
  limitBy: number
  /** 限购模式 */
  limitMode: number
  /** 最多购买件数 */
  limitNumMax: number
  /** 最少购买件数 */
  limitNumMin: number
  /** 购买须知 */
  mustKnow: string
  /** 提前购买 */
  needAhead: number
  /** 下单身份证填写 */
  needIdcard: number
  /** 下单姓名填写 */
  needName: number
  /** 预约使用 */
  needReservation: number
  /** 开售终止时间 */
  onsaleEndAt: string
  /** 开售模式 */
  onsaleMode: number
  /** 立即上架 */
  onsaleNow: number
  /** 开售起始时间 */
  onsaleStartAt: string
  /** 商品其他属性id */
  otherDescAttributeIds: { [key: string]: any }
  /** 商品其他属性json */
  otherDescAttributeJson: { [key: string]: any }
  /** 商品海报json */
  posters: { [key: string]: any }
  /** 商品海报 */
  posterType: number
  /** 二维码来源 */
  qrcodeSource: number
  /** 二维码类型 */
  qrcodeType: number
  /** 退款审核 */
  refundAudit: number
  /** 退款金额类型 */
  refundMode: number
  /** 预约地址 */
  reservationAddress: string
  /** 销售单位 */
  saleUnit: string
  /** 分享缩略图 */
  shareImage: string
  /** 分享副标题 */
  shareSubtitle: string
  /** 分享主标题 */
  shareTitle: string
  /** 销售数量 */
  soldNum: number
  /** 商品排序 */
  sort: number
  /** 规格属性ID */
  specAttributeId: number
  /** 启用状态 */
  status: number
  /** 选择可使用门店，最多展示 3 条 */
  stores: GoodsDetailStore[]
  /** 可使用门店类型，全部／指定 */
  storeType: number
  /** 可使用门店总数量 */
  storeNum: number
  /** 商品名称 */
  title: string
  /** 商品类型 */
  type: number
  /** 不可用日期 */
  unavailableDate: number
  /** 指定日期范围不可用结束日期时间 */
  unavailableDateEndAt: string
  /** 法定节假日不可用 */
  unavailableDateHoliday: number
  /** 指定日期范围不可用 */
  unavailableDateRange: number
  /** 指定日期范围不可用开始日期时间 */
  unavailableDateStartAt: string
  /** 限制星期几不可用，例： [1,2,3,4,5,6,7]，则分别为周一到周日 */
  unavailableDateWeekday: { [key: string]: any }
  /** 核销提示 */
  verificationTips: string
  /** 供应商id */
  supplierId?: string
}

interface GoodsDetailStore {
  /** 门店ID */
  id: string
  /** 门店名称 */
  name: string
  /** 地区 */
  region: string
  /** 地址 */
  address: string
  /** 联系人信息 */
  contactInfo: { contactName: string; contactPhone: string }[]
  /** 距离 */
  distance?: number
  /** 纬度 */
  latitude: string
  /** 坐标 */
  location: string
  /** 经度 */
  longitude: string
  /** 开始营业时间 */
  openingAt: string
  /** 打烊时间 */
  closingAt: string
  /** 状态 */
  status: number
}

/**
 * 商品展示规则
 */
export interface IGoodsShowRule {
  createTime: string
  createUser: string
  dashPrice: number
  dashPriceText: string
  id: string
  merchantId: string
  sellingPrice: number
  sellingPriceText: string
  tenantId: string
  updateTime: string
  updateUser: string
}

/**
 * @param showType
 * 0 不展示
 * 1 猜你喜欢
 * 2 热门商品
 * 3 近期热销
 * @param categoryId
 * 导航类目id 当showType=1时传入
 */
export interface GoodsListByRule {
  showType: number
  categoryIds?: string
}

export interface GoodsListByRuleItem {
  id: string
  title: string
  type: number
  code: string
  coverImages: string[]
  sort: number
  status: number
  priceMin: string
  priceMax: string
  underlinePrice: string
}
