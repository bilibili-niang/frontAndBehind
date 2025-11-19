/** 商品类型：实物商品 */
export const GOODS_TYPE_ENTITY = 0
/** 商品类型：门店核销商品 */
export const GOODS_TYPE_STORE_VERIFICATION = 1
/** 商品类型：景点门票 */
export const GOODS_TYPE_ATTRACTION_TICKET = 2
/** 商品类型：卡密商品 */
export const GOODS_TYPE_CARD_CODE = 3
/** 商品类型：剧院演出 */
export const GOODS_TYPE_THEATRE_SHOW = 4
/** 商品类型：账号直充 */
export const GOODS_TYPE_ACCOUNT_RECHARGE = 5
/** 商品类型 */
export const GOODS_TYPE_OPTIONS = [
  { label: '实物商品', value: GOODS_TYPE_ENTITY },
  { label: '卡券商品', value: GOODS_TYPE_STORE_VERIFICATION }
  // { label: '景点门票', value: GOODS_TYPE_ATTRACTION_TICKET },
  // { label: '卡密商品', value: GOODS_TYPE_CARD_CODE },
  // { label: '剧院演出', value: GOODS_TYPE_THEATRE_SHOW },
  // { label: '账号直充', value: GOODS_TYPE_ACCOUNT_RECHARGE }
]

/** 商品开售模式：上架即售 */
export const GOODS_ON_SALE_MODE_IMMEDIATE = 0
/** 商品开售模式：指定时间 */
export const GOODS_ON_SALE_MODE_TIMING = 1
/** 商品开售模式 */
export const GOODS_ON_SALE_MODE_OPTIONS = [
  { label: '上架即售', value: GOODS_ON_SALE_MODE_IMMEDIATE },
  { label: '指定时间', value: GOODS_ON_SALE_MODE_TIMING }
]

/** 商品限购模式：不限购 */
export const GOODS_PURCHASE_LIMIT_MODE_NO_LIMIT = 0
/** 商品限购模式：限购 */
export const GOODS_PURCHASE_LIMIT_MODE_LIMIT = 1
/** 商品限购模式 */
export const GOODS_PURCHASE_LIMIT_MODE_OPTIONS = [
  { label: '不限购', value: GOODS_PURCHASE_LIMIT_MODE_NO_LIMIT },
  { label: '限购', value: GOODS_PURCHASE_LIMIT_MODE_LIMIT }
]

/** 商品限购依据：每笔订单 */
export const GOODS_PURCHASE_LIMIT_BY_ODER = 0
/** 商品限购依据：每个用户ID */
export const GOODS_PURCHASE_LIMIT_BY_USER = 1
/** 商品限购依据 */
export const GOODS_PURCHASE_LIMIT_BY_OPTIONS = [
  { label: '每笔订单', value: GOODS_PURCHASE_LIMIT_BY_ODER },
  { label: '每个ID', value: GOODS_PURCHASE_LIMIT_BY_USER }
]

/** 商品立即上架：立即上架 */
export const GOODS_ON_SALE_IMMEDIATE_YES = 1
/** 商品立即上架：暂不上架 */
export const GOODS_ON_SALE_IMMEDIATE_NOT = 0
/** 商品立即上架 */
export const GOODS_ON_SALE_IMMEDIATE_OPTIONS = [
  { label: '立即上架', value: GOODS_ON_SALE_IMMEDIATE_YES },
  { label: '暂不上架', value: GOODS_ON_SALE_IMMEDIATE_NOT }
]

/** 商品退款模式：可退款 */
export const GOODS_REFUND_MODE_ALLOW = 1
/** 商品退款模式：不可退款 */
export const GOODS_REFUND_MODE_NOT_ALLOW = 0
/** 商品退款模式 */
export const GOODS_REFUND_MODE_OPTIONS = [
  { label: '可退款', value: GOODS_REFUND_MODE_ALLOW },
  { label: '不可退款', value: GOODS_REFUND_MODE_NOT_ALLOW }
]

/** 退款审核：未发货不需要审核 */
export const GOODS_REFUND_AUDIT_NOT_REQUIRED_BEFORE_SHIP = 0
/** 退款审核：需要审核 */
export const GOODS_REFUND_AUDIT_REQUIRED = 1
// 退款审核
export const GOODS_REFUND_AUDIT_OPTIONS = [
  { label: '不需要审核', value: GOODS_REFUND_AUDIT_NOT_REQUIRED_BEFORE_SHIP },
  { label: '需要审核', value: GOODS_REFUND_AUDIT_REQUIRED }
]
export const GOODS_REFUND_AUDIT_ENTITY_OPTIONS = [
  { label: '未发货不需要审核', value: GOODS_REFUND_AUDIT_NOT_REQUIRED_BEFORE_SHIP },
  { label: '需要审核', value: GOODS_REFUND_AUDIT_REQUIRED }
]

/** 商品有效期类型：日期范围内有效 */
export const GOODS_VALID_TIME_RANGE = 0
/** 商品有效期类型：下单后时长内有效 */
export const GOODS_VALID_TIME_DURATION = 1
/** 商品有效期类型 */
export const GOODS_VALID_TIME_OPTIONS = [
  { label: '日期范围内有效', value: GOODS_VALID_TIME_RANGE },
  { label: '下单后时长内有效', value: GOODS_VALID_TIME_DURATION }
]

/** 商品可用时间：营业时间内可用 */
export const GOODS_USABLE_TIME_OPENING = 0
/** 商品可用时间：指定时间内可用 */
export const GOODS_USABLE_TIME_RANGE = 1
/** 商品可用时间 */
export const GOODS_USABLE_TIME_OPTIONS = [
  { label: '营业时间内可用', value: GOODS_USABLE_TIME_OPENING },
  { label: '指定时间内可用', value: GOODS_USABLE_TIME_RANGE }
]

/** 核销类商品过期处理方式：自动退 */
export const GOODS_EXPIRE_MODE_REFUND = 0
/** 核销类商品过期处理方式：自动核销 */
export const GOODS_EXPIRE_MODE_COMPLETE = 1
/** 核销类商品过期处理方式 */
export const GOODS_EXPIRE_MODE_OPTIONS = [
  { label: '过期自动退', value: GOODS_EXPIRE_MODE_REFUND },
  { label: '过期自动核销', value: GOODS_EXPIRE_MODE_COMPLETE }
]

/** 商品下单需要填写身份证、姓名：不需要 */
export const ID_CARD_REQUIRED_NOT = 0
/** 商品下单需要填写身份证、姓名：填写 1 个 */
export const ID_CARD_REQUIRED_ONE = 1
/** 商品下单需要填写身份证、姓名：按量填写 */
export const ID_CARD_REQUIRED_BY_COUNT = 1
/** 商品下单需要填写身份证、姓名 */
export const ID_CARD_REQUIRED_OPTIONS = [
  { label: '无需填写', value: 0 },
  { label: '填写 1 个', value: 1 },
  { label: '按购买数量填写', value: 2 }
]

/** 销售单位 */
export const GOODS_SALE_UNIT_OPTIONS = [
  { value: '件', label: '件' },
  { value: '只', label: '只' },
  { value: '瓶', label: '瓶' },
  { value: '袋', label: '袋' },
  { value: '包', label: '包' },
  { value: '箱', label: '箱' },
  { value: '盒', label: '盒' },
  { value: '条', label: '条' },
  { value: '听', label: '听' },
  { value: '杯', label: '杯' },
  { value: '提', label: '提' },
  { value: '捆', label: '捆' },
  { value: '码', label: '码' },
  { value: '把', label: '把' },
  { value: '本', label: '本' },
  { value: '台', label: '台' },
  { value: '块', label: '块' },
  { value: '对', label: '对' },
  { value: '套', label: '套' },
  { value: '双', label: '双' },
  { value: '克', label: '克' },
  { value: '千克', label: '千克' },
  { value: '公斤', label: '公斤' },
  { value: '吨', label: '吨' },
  { value: 'g', label: 'g' },
  { value: 'kg', label: 'kg' },
  { value: 't', label: 't' },
  { value: '斤', label: '斤' },
  { value: '钱', label: '钱' },
  { value: '两', label: '两' },
  { value: '担', label: '担' }
]

/** 商品允许分享 */
export const GOODS_SHARE_ENABLE_ON = 1
/** 商品不允许分享 */
export const GOODS_SHARE_ENABLE_OFF = 0
/** 商品是否允许分享 */
export const GOODS_SHARE_ENABLE_OPTIONS = [
  { value: GOODS_SHARE_ENABLE_ON, label: '允许分享' },
  { value: GOODS_SHARE_ENABLE_OFF, label: '禁止分享' }
]

/** 商品海报类型：默认 */
export const GOODS_POSTER_TYPE_DEFAULT = 0
/** 商品海报类型：自定义 */
export const GOODS_POSTER_TYPE_CUSTOM = 1
/** 商品海报类型 */
export const GOODS_POSTER_TYPE_OPTIONS = [
  { value: GOODS_POSTER_TYPE_DEFAULT, label: '默认' },
  { value: GOODS_POSTER_TYPE_CUSTOM, label: '自定义' }
]

/** 商品分类类型：关联商品 */
export const GOODS_CATEGORY_TYPE_GOODS = 1
/** 商品分类类型：关联类目 */
export const GOODS_CATEGORY_TYPE_CATEGORY = 2
/** 商品分类类型：关联动作 */
export const GOODS_CATEGORY_TYPE_ACTION = 3

export const GOODS_CATEGORY_TYPE_OPTIONS = [
  { label: '关联类目', value: GOODS_CATEGORY_TYPE_CATEGORY },
  { label: '关联商品', value: GOODS_CATEGORY_TYPE_GOODS },
  { label: '关联动作', value: GOODS_CATEGORY_TYPE_ACTION }
]
