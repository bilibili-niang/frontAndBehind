enum couponScope {
  all = 0,
  supplier = 1,
  goods = 2
}
export const COUPON_SCOPE_OPTIONS = [
  { label: '全场通用券', value: couponScope.all },
  { label: '指定供应商券', value: couponScope.supplier },
  { label: '指定商品券', value: couponScope.goods }
]

enum couponGoodsRangeType {
  valid = 1,
  invalid = 0
}
const COUPON_GOODS_RANGE_TYPE_OPTIONS = [
  { label: '指定商品可用', value: couponGoodsRangeType.valid },
  { label: '指定商品不可用', value: couponGoodsRangeType.invalid }
]

enum couponReceiveTimeRangeType {
  unlimit = 0,
  limit = 1
}

export enum couponUseTimeRangeType {
  unlimit = 0,
  timeRange = 1,
  duration = 2
}

enum couponReceiveCountLimit {
  total = 3,
  daily = 0,
  weekly = 1,
  monthly = 2
}

const couponReceiveCountLimitOptions = [
  { label: '累计', value: couponReceiveCountLimit.total },
  { label: '每天', value: couponReceiveCountLimit.daily },
  { label: '每周', value: couponReceiveCountLimit.weekly },
  { label: '每月', value: couponReceiveCountLimit.monthly }
]

export interface IDiscountCoupon {
  id: string
  merchantId: string
  name: String
  /** 使用说明 */
  instructions: string
  /** 类型 */
  type: number
  /** 优惠券模板id */
  templateId: string
  /** 门槛金额，单位：分 */
  thresholdAmount: number
  /** 优惠券面值，单位：分 */
  discountAmount: number
  /** 发放数量 */
  quantity: number
  /** 使用范围 */
  scope: couponScope
  supplierIds: string[]
  /** 指定商品可用／不可以 */
  goodsScope: couponGoodsRangeType
  /** 商品(分组)id */
  goodsIds: string[]
  /** 商品／商品分组 */
  goodsType: number
  /** 领取限制类型 */
  drawType: couponUseTimeRangeType
  drawStartTime: string
  drawEndTime: string
  useType: number
  useStartTime: string
  useEndTime: string
  limitedDays: number
  drawTimes: number
  drawTimesLimit: number
  showStatus: number
  status: number

  // 用户相关

  /** 是否已领 */
  hasRecord: boolean
  /** 领取数量限制 */
  receiveLimit: number
  recordNo?: string
}

export interface IDiscountCouponRecord {
  recordNo: string
  createTime: string
  discountAmount: number
  drawEndTime?: string
  drawStartTime?: string
  drawTimes?: number
  drawTimesLimit?: number
  drawType?: number
  goodsIds?: string[]
  goodsScope?: number
  goodsType?: number
  id?: string
  instructions?: string
  isDeleted?: number
  limitedDays?: number
  merchantId?: string
  name?: string
  quantity?: number
  scope?: number
  showStatus?: number
  status?: number
  supplierIds?: string[]
  templateId: string
  thresholdAmount: number
  type: number
  updateTime?: string
  updateUser?: string
  useEndTime?: string
  useStartTime?: string
  useType?: number
  startTime: string
  endTime: string
  couponSnapshot?: IDiscountCoupon
}
