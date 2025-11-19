/** 卡券类型：二维码 + 卡号 */
export const COUPON_TYPE_QRCODE_CODE = 0
/** 卡券类型：仅二维码 */
export const COUPON_TYPE_QRCODE_ONLY = 1
/** 卡券类型：卡号 + 卡密 */
export const COUPON_TYPE_CODE_PWD = 2

/** 卡券状态：待发放 */
export const COUPON_STATUS_PENDING_SEND = 0
/** 卡券状态：待使用 */
export const COUPON_STATUS_PENDING_USE = 1
/** 卡券状态：发放失败 */
export const COUPON_STATUS_SEND_FAILED = 2
/** 卡券状态：已使用 */
export const COUPON_STATUS_USED = 3
/** 卡券状态：已过期 */
export const COUPON_STATUS_EXPIRED = 4
/** 卡券状态：已作废 */
export const COUPON_STATUS_CANCELED = 5
/** 卡券状态 */
export const COUPON_STATUS_OPTIONS = [
  { label: '待发放', value: COUPON_STATUS_PENDING_SEND },
  { label: '待使用', value: COUPON_STATUS_PENDING_USE },
  { label: '发放失败', value: COUPON_STATUS_SEND_FAILED },
  { label: '已使用', value: COUPON_STATUS_USED },
  { label: '已过期', value: COUPON_STATUS_EXPIRED },
  { label: '已作废', value: COUPON_STATUS_CANCELED }
]

/** 卡券有效期类型：指定时间范围内 */
export const COUPON_VALID_TYPE_DURATION = 0
/** 卡券有效期类型：指定天数内 */
export const COUPON_VALID_TYPE_DAYS = 1
