interface GoodsSnapshot {
  /** 商品ID */
  id: string
  /** 商品编码 */
  code: string
  /** 商品排序 */
  sort: number
  /** 商品类型 */
  type: number
  /** 商品标题 */
  title: string
  /** 商品详情 */
  detail: string
  /** 商品状态 */
  status: number
  /** 商品所属店铺 */
  stores: any[]
  /** 商品品牌ID */
  brandId: string
  /** 商品费用清单 */
  feeList: { skuDetails: any[] }
  /** 限购方式 */
  limitBy: number
  /** 商品海报 */
  posters: { image: string | null; qrcodeX: any; qrcodeY: any; qrcodeSize: any }
  /** 商品已售数量 */
  soldNum: number
  /** 商品购买结束时间 */
  buyEndAt: any
  /** 商品注意事项 */
  mustKnow: string
  /** 是否需要姓名 */
  needName: number
  /** 商品销售单位 */
  saleUnit: string
  /** 商户ID */
  tenantId: number
  /** 提前天数 */
  aheadDays: number
  /** 是否支持退款 */
  canRefund: number
  /** 是否已删除 */
  isDeleted: number
  /** 限购模式 */
  limitMode: number
  /** 是否需要提前 */
  needAhead: number
  /** 是否立即上架 */
  onsaleNow: number
  /** 商店类型 */
  storeType: number
  /** 是否允许分享 */
  allowShare: number
  /** 商品购买开始时间 */
  buyStartAt: any
  /** 创建时间 */
  createTime: number
  /** 创建者 */
  createUser: string
  /** 过期天数 */
  expireDays: number
  /** 过期类型 */
  expireType: number
  /** 商户ID */
  merchantId: string
  /** 是否需要身份证 */
  needIdcard: number
  /** 上架模式 */
  onsaleMode: number
  /** 海报类型 */
  posterType: number
  /** 二维码类型 */
  qrcodeType: number
  /** 退款模式 */
  refundMode: number
  /** 分享图片 */
  shareImage: string | null
  /** 分享标题 */
  shareTitle: string | null
  /** 更新时间 */
  updateTime: number
  /** 更新者 */
  updateUser: string
  /** 分类ID列表 */
  categoryIds: string[]
  /** 优惠券样式 */
  couponStyle: number
  /** 封面图片列表 */
  coverImages: string[]
  /** 过期结束时间 */
  expireEndAt: any
  /** 限购最大数量 */
  limitNumMax: number
  /** 限购最小数量 */
  limitNumMin: number
  /** 上架结束时间 */
  onsaleEndAt: number | null
  /** 退款审核 */
  refundAudit: number
  /** 二维码来源 */
  qrcodeSource: number
  /** 可用日期 */
  availableDate: number
  /** 过期处理 */
  expireProcess: number
  /** 过期开始时间 */
  expireStartAt: any
  /** 上架开始时间 */
  onsaleStartAt: number | null
  /** 分享副标题 */
  shareSubtitle: string | null
  /** 可用次数 */
  availableTimes: number
  /** 是否需要预订 */
  needReservation: number
  /** 规格属性ID */
  specAttributeId: any
  /** 不可用日期 */
  unavailableDate: number
  /** 验证提示 */
  verificationTips: string | null
}

interface UnifiedOrder {
  /** 统一订单ID */
  id: string
  /** 商户ID */
  merchantId: string
  /** 租户ID */
  tenantId: string
  /** 商户名称 */
  merchantName: string
  /** 订单来源 */
  origin: number
  /** 订单编号 */
  orderNo: string
  /** 外部订单编号 */
  outOrderNo: string
  /** 用户ID */
  userId: string
  /** 用户手机号 */
  userMobile: string | null
  /** 订单金额 */
  amount: number
  /** 折扣金额 */
  discountAmount: number
  /** 支付金额 */
  payAmount: number
  /** 支付状态 */
  payStatus: number
  /** 支付方式 */
  payMethod: number
  /** 支付时间 */
  payTime: string
  /** 支付更新时间 */
  payUpdateTime: string
  /** 订单状态 */
  status: number
  /** 场景 */
  scene: any
  /** 完成时间 */
  completedTime: any
  /** 创建者 */
  createUser: string
  /** 创建时间 */
  createTime: string
  /** 更新者 */
  updateUser: string
  /** 更新时间 */
  updateTime: string
  /** 是否已删除 */
  isDeleted: number
}

export interface ISubOrder {
  /** 子订单ID */
  id: string
  /** 商户ID */
  merchantId: string
  /** 租户ID */
  tenantId: string
  /** 主订单ID */
  mainOrderId: string
  /** 主订单编号 */
  mainOrderNo: string
  /** 订单编号 */
  orderNo: string
  /** 商品ID */
  goodsId: string
  /** 商品编码 */
  goodsCode: string
  /** 商品名称 */
  goodsName: string
  /** 商品快照 */
  goodsSnapshot: GoodsSnapshot
  /** 商品库存ID */
  goodsStockId: string
  /** 商品库存名称 */
  goodsStockName: string | null
  /** 商品库存编码 */
  goodsStockCode: string | null
  /** 商品库存快照 */
  goodsStockSnapshot: any
  /** 价格 */
  price: number
  /** 价格文本 */
  priceText: string
  /** 折扣金额 */
  discountAmount: number
  /** 折扣金额文本 */
  discountAmountText: string
  /** 运费 */
  freightAmount: number
  /** 运费文本 */
  freightAmountText: string
  /** 支付金额 */
  payAmount: number
  /** 支付金额文本 */
  payAmountText: string
  /** 数量 */
  count: number
  /** 金额 */
  amount: number
  /** 金额文本 */
  amountText: string
  /** 类型 */
  type: number
  /** 状态 */
  status: number
  /** 联系省份 */
  contactProvince: string
  /** 联系城市 */
  contactCity: string
  /** 联系区域 */
  // contact

  District: string
  /** 联系地址 */
  contactAddress: string
  /** 联系人姓名 */
  contactName: string
  /** 联系人手机号 */
  contactMobile: string
  /** 快递单号 */
  courierNo: string
  /** 快递公司名称 */
  courierName: string
  /** 快递状态 */
  courierStatus: number
  /** 是否存在售后服务 */
  existAfterSaleService: number
  /** 创建者 */
  createUser: string
  /** 创建时间 */
  createTime: string
  /** 更新者 */
  updateUser: string
  /** 更新时间 */
  updateTime: string

  coupons: any[]

  /** 售后订单物流状态 */
  afterSaleOrderCourierStatus: number
  /** 售后订单号 */
  afterSaleOrderNo: string
  /** 售后订单状态 */
  afterSaleOrderStatus: number

  coverImages?: string[]

  verificationCode: string

  // 以下为前端拓展的字段

  /** 支付单价 */
  $payUnitAmount: number
  /** 支付单价文本 */
  $payUnitAmountText: string
}

export interface IOrderDetail {
  /** 订单ID */
  id: string
  /** 商户ID */
  merchantId: string
  /** 租户ID */
  tenantId: string
  /** 订单编号 */
  orderNo: string
  /** 状态 */
  status: number
  /** 用户ID */
  userId: string
  /** 用户手机号 */
  userMobile: string
  /** 价格 */
  price: number
  /** 价格文本 */
  priceText: string
  /** 金额 */
  amount: number
  /** 金额文本 */
  amountText: string
  /** 折扣金额 */
  discountAmount: number
  /** 折扣金额文本 */
  discountAmountText: string
  /** 运费 */
  freightAmount: number
  /** 运费文本 */
  freightAmountText: string
  /** 支付金额 */
  payAmount: number
  /** 支付金额文本 */
  payAmountText: string
  /** 支付状态 */
  payStatus: number
  /** 支付方式 */
  payMethod: number
  /** 支付时间 */
  payTime: string
  /** 支付更新时间 */
  payUpdateTime: string
  /** UTM来源 */
  utmSource: any
  /** UTM来源名称 */
  utmSourceName: any
  /** UTM媒介 */
  utmMedium: any
  /** UTM关键字 */
  utmKeyword: any
  /** UTM内容 */
  utmContent: any
  /** 创建者 */
  createUser: string
  /** 创建时间 */
  createTime: string
  /** 更新者 */
  updateUser: string
  /** 更新时间 */
  updateTime: string
  /** 子订单列表 */
  subOrders: ISubOrder[]
  /** 统一订单信息 */
  unifiedOrder: UnifiedOrder
  /** 订单卡券 */
  coupons: Coupon[]
}

interface Coupon {
  /** 卡号 */
  cardNo: string
  /** 可用有效期结束时间 */
  expireEndAt?: string
  /** 可用有效期开始时间，expireType = 1 时，值为null */
  expireStartAt: string
  /** 过期类型 */
  expireType: number
  /** 卡券密码 */
  password: string
  /** 券码形式 */
  qrcodeType: number
  /** 卡券状态 */
  status: number
  /** 卡券总共可使用次数 */
  sumTimes: number
  /** 剩余可使用次数，卡券总共可使用次数=1时，值为null */
  usableTimes?: number
  /** 已使用次数，卡券总共可使用次数=1时，值为null */
  usedTimes?: number
}

/**
 * 售后订单
 */
export interface IAfterSaleOrder {
  /**
   * 售后订单号
   */
  afterSaleOrderNo: string
  /**
   * 申请图片凭证
   */
  attachments: string[]
  /**
   * 物流公司名称
   */
  courierName: string
  /**
   * 物流单号
   */
  courierNo: string
  /**
   * 物流状态，0-无需物流 1-已签收 2-待发货 3-已发货 4-已退回
   */
  courierStatus: number
  /**
   * 创建时间
   */
  createTime: string
  /**
   * 申请描述
   */
  describe: string
  /**
   * 主订单号
   */
  mainOrderNo: string
  /**
   * 申请原因
   */
  reason: string
  /**
   * 退款状态，0-未处理 1-退款成功 2-退款失败
   */
  refund: number
  /**
   * 售后状态，0-待商家处理中 1-同意退款 2-拒绝退款 3-商家关闭 4-用户取消
   */
  status: number
  /**
   * 子订单详情
   */
  subOrder: ISubOrder
  /**
   * 子订单号
   */
  subOrderNo: string
  /**
   * 售后类型，1-仅退款 2-退货退款
   */
  type: number
  /**
   * 更新时间
   */
  updateTime: string

  /** 退回地址 */
  returnAddress?: {
    address: string
    name: string
    phone: string
  }

  /** 退回备注 */
  returnMark?: string
  /** 退款备注 */
  refundMark?: string
  /** 退款金额，单位 分 */
  amount?: number
  applyRefundChannelInfos?: any[]
}
