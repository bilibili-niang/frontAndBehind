import { COLOR_DISABLED, COLOR_ERROR, COLOR_PROCESSING, COLOR_SUCCESS, COLOR_WARNING } from '@pkg/config'

export enum DiscountCouponStatus {
  /** 待使用 */
  useable = 0,
  /** 使用中 */
  using = 1,
  /** 已吊销 */
  revoked = 2,
  /** 已过期 */
  expired = 3,
  /** 已使用 */
  used = 4
}

export const DISCOUNT_COUPON_STATUS_OPTIONS = [
  { label: '待使用', value: DiscountCouponStatus.useable, color: COLOR_PROCESSING },
  { label: '使用中', value: DiscountCouponStatus.using, color: COLOR_WARNING },
  { label: '已吊销', value: DiscountCouponStatus.revoked, color: COLOR_ERROR },
  { label: '已过期', value: DiscountCouponStatus.expired, color: COLOR_DISABLED },
  { label: '已使用', value: DiscountCouponStatus.used, color: COLOR_SUCCESS }
]

export enum DiscountCouponScene {
  goodsDetail = 0,
  goodsGroup = 1,
  couponTemplate = 2,
  customPage = 3,
  activity = 4
}

export const DISCOUNT_COUPON_SCENE_OPTIONS = [
  { label: '商品详情', value: DiscountCouponScene.goodsDetail },
  { label: '商品分组', value: DiscountCouponScene.goodsGroup },
  { label: '卡券模板页', value: DiscountCouponScene.couponTemplate },
  { label: '自定义页面', value: DiscountCouponScene.customPage },
  { label: '优惠券投放活动', value: DiscountCouponScene.activity }
]
