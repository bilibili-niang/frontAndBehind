import { COLOR_DISABLED, COLOR_ERROR, COLOR_PROCESSING, COLOR_SUCCESS } from './index'

export const GOODS_TYPE_ENTITY = 0

/** 订单来源：商品详情下单 */
export const ORDER_ORIGIN_DETAIL = 0
/** 订单来源：购物车 */
export const ORDER_ORIGIN_CART = 1

/** 订单状态：待付款 */
export const ORDER_STATUS_PENDING_PAYMENT = 0
/** 订单状态：待发货 */
export const ORDER_STATUS_PENDING_SHIPMENT = 1
export const SUB_ORDER_STATUS_PENDING_SHIPMENT = 1
/** 订单状态：部分发货 */
export const ORDER_STATUS_PARTIAL_SHIPMENT = 2
/** 订单状态：待收货 */
export const ORDER_STATUS_PENDING_DELIVERY = 3
/** 订单状态：已取消 */
export const ORDER_STATUS_CANCELLED = 4
/** 订单状态：已关闭 */
export const ORDER_STATUS_CLOSED = 5
/** 订单状态：已完成 */
export const ORDER_STATUS_COMPLETED = 6
/** 实物订单状态 */
export const ENTITY_ORDER_STATUS_OPTIONS = [
  { value: ORDER_STATUS_PENDING_PAYMENT, label: '待付款', description: '订单将超时，请尽快支付。' },
  { value: ORDER_STATUS_PENDING_SHIPMENT, label: '待发货', description: '您的订单已成功支付，正在准备发货中。' },
  { value: ORDER_STATUS_PARTIAL_SHIPMENT, label: '部分发货', description: '您的订单已成功支付，正在准备发货中。' },
  { value: ORDER_STATUS_PENDING_DELIVERY, label: '待收货', description: '您的订单已成功发货，正在快速运输中。' },
  { value: ORDER_STATUS_CANCELLED, label: '已取消', description: '' },
  { value: ORDER_STATUS_CLOSED, label: '已关闭', description: '' },
  { value: ORDER_STATUS_COMPLETED, label: '已完成', description: '' }
]
/** 卡券订单状态 */
export const COUPON_ORDER_STATUS_OPTIONS = [
  { value: ORDER_STATUS_PENDING_PAYMENT, label: '待付款', description: '订单将超时，请尽快支付。' },
  { value: ORDER_STATUS_PENDING_SHIPMENT, label: '待发放', description: '您的订单已成功支付，正在准备发放卡券中。' },
  { value: ORDER_STATUS_PARTIAL_SHIPMENT, label: '部分发放', description: '您的订单已成功支付，正在准备发放卡券中。' },
  { value: ORDER_STATUS_PENDING_DELIVERY, label: '待使用', description: '卡券已发放成功，请及时使用。' },
  { value: ORDER_STATUS_CANCELLED, label: '已取消', description: '' },
  { value: ORDER_STATUS_CLOSED, label: '已关闭', description: '' },
  { value: ORDER_STATUS_COMPLETED, label: '已完成', description: '' }
]

/** 订单状态 */
export const ORDER_STATUS_OPTIONS = (type: string | number = 0) => {
  return type == GOODS_TYPE_ENTITY ? ENTITY_ORDER_STATUS_OPTIONS : COUPON_ORDER_STATUS_OPTIONS
}

/** 订单支付状态：未付款 */
export const ORDER_PAYMENT_STATUS_PENDING = 0
/** 订单支付状态：付款成功 */
export const ORDER_PAYMENT_STATUS_SUCCESS = 1
/** 订单支付状态：部分退款 */
export const ORDER_PAYMENT_STATUS_PARTIAL_REFUND = 2
/** 订单支付状态：已全额退款 */
export const ORDER_PAYMENT_STATUS_FULL_REFUND = 3
/** 订单支付状态 */
export const ORDER_PAYMENT_STATUS_OPTIONS = [
  { value: ORDER_PAYMENT_STATUS_PENDING, label: '未付款' },
  { value: ORDER_PAYMENT_STATUS_SUCCESS, label: '付款成功' },
  { value: ORDER_PAYMENT_STATUS_PARTIAL_REFUND, label: '部分退款' },
  { value: ORDER_PAYMENT_STATUS_FULL_REFUND, label: '已全额退款' }
]

/** 主支付方式：无 */
export const PAYMENT_METHOD_NONE = 0
/** 主支付方式：余额支付 */
export const PAYMENT_METHOD_BALANCE = 1
/** 主支付方式 */
export const PAYMENT_METHOD_OPTIONS = [
  { value: PAYMENT_METHOD_NONE, label: '无' },
  { value: PAYMENT_METHOD_BALANCE, label: '余额支付' }
]

/** 副支付方式：微信支付 */
export const SUB_PAYMENT_METHOD_WECHAT_PAY = 0
export const SUB_PAYMENT_METHOD_OPTIONS = [{ value: SUB_PAYMENT_METHOD_WECHAT_PAY, label: '微信支付' }]

/** 付款截止时间单位：分钟 */
export const PAYMENT_END_UNIT_MINUTE = 0
/** 付款截止时间单位：小时 */
export const PAYMENT_END_UNIT_HOUR = 1
/** 付款截止时间单位：天 */
export const PAYMENT_END_UNIT_DAY = 2

/** 支付渠道：余额支付 */
export const PAYMENT_CHANNEL_BALANCE = 'UserAccount'
/** 支付渠道：微信支付 */
export const PAYMENT_CHANNEL_WECHAT_PAY = 'Wechat'
/** 支付渠道：通联支付（云闪付） */
export const PAYMENT_CHANNEL_ALL_IN_PAY = 'Allinpay'
/** 支付渠道 */
export const PAYMENT_CHANNEL_OPTIONS = [
  { label: '微信支付', label2: '微信', value: PAYMENT_CHANNEL_WECHAT_PAY },
  { label: '余额支付', label2: '余额', value: PAYMENT_CHANNEL_BALANCE },
  { label: '云闪付', label2: '支付渠道（原路返回）', value: PAYMENT_CHANNEL_ALL_IN_PAY }
]

/** 售后订单详情：待商家处理中 */
export const ORDER_AFTER_SALES_STATUS_PENDING = 0
/** 售后订单详情：已同意售后 */
export const ORDER_AFTER_SALES_STATUS_ACCESS = 1
/** 售后订单详情：已拒绝售后 */
export const ORDER_AFTER_SALES_STATUS_REFUSE = 2
/** 售后订单详情：商家关闭 */
export const ORDER_AFTER_SALES_STATUS_CLOSE = 3
/** 售后订单详情：用户取消 */
export const ORDER_AFTER_SALES_STATUS_CANCEL = 4
/** 售后订单详情：待商家收货 */
export const ORDER_AFTER_SALES_STATUS_PENDING_RECEIVE = 5
/** 售后订单详情：完成售后 */
export const ORDER_AFTER_SALES_STATUS_COMPLETE = 6

export const ORDER_AFTER_SALES_STATUS_OPTIONS = [
  { label: '待商家处理中', value: ORDER_AFTER_SALES_STATUS_PENDING, color: COLOR_PROCESSING },
  { label: '已同意售后', value: ORDER_AFTER_SALES_STATUS_ACCESS, color: COLOR_SUCCESS },
  { label: '商家拒绝', value: ORDER_AFTER_SALES_STATUS_REFUSE, color: COLOR_ERROR },
  { label: '商家关闭', value: ORDER_AFTER_SALES_STATUS_CLOSE, color: COLOR_DISABLED },
  { label: '已取消', value: ORDER_AFTER_SALES_STATUS_CANCEL, color: COLOR_DISABLED },
  { label: '待商家收货', value: ORDER_AFTER_SALES_STATUS_PENDING_RECEIVE, color: COLOR_PROCESSING },
  { label: '退款成功', value: ORDER_AFTER_SALES_STATUS_COMPLETE, color: COLOR_SUCCESS }
]

export const AFTER_SALE_TYPE_REFUND = 2
export const AFTER_SALE_TYPE_REFUND_ONLY = 1
export const AFTER_SALE_TYPE_OPTIONS = [
  { label: '退货退款', value: AFTER_SALE_TYPE_REFUND },
  { label: '仅退款', value: AFTER_SALE_TYPE_REFUND_ONLY }
]

/** 售后订单物流状态：无需物流 */
export const AFTER_SALE_EXPRESS_STATUS_NONE = 0
/** 售后订单物流状态：（商家）已签收 */
export const AFTER_SALE_EXPRESS_STATUS_SIGNED = 1
/** 售后订单物流状态：待（买家）寄回 */
export const AFTER_SALE_EXPRESS_STATUS_PENDING = 2
/** 售后订单物流状态：（买家）已发货 */
export const AFTER_SALE_EXPRESS_STATUS_SHIPPED = 3
/** 售后订单物流状态：已退回（给买家） */
export const AFTER_SALE_EXPRESS_STATUS_RETURNED = 4

export const AFTER_SALE_EXPRESS_STATUS_OPTIONS = [
  { label: '无需物流', value: AFTER_SALE_EXPRESS_STATUS_NONE },
  { label: '商家已签收', value: AFTER_SALE_EXPRESS_STATUS_SIGNED },
  { label: '待买家寄回', value: AFTER_SALE_EXPRESS_STATUS_PENDING },
  { label: '买家已寄回', value: AFTER_SALE_EXPRESS_STATUS_SHIPPED },
  { label: '商家已退回', value: AFTER_SALE_EXPRESS_STATUS_RETURNED }
]

/**
 * A. 申请仅退款，待商家处理  status = 0 ，type = 2
 *
 * B. 申请退货退款，待商家处理 status = 0， type = 1
 *
 * C. 已同意仅退款，待退款 status = 1，refund = 0
 *
 * D. 已同意退货退款，待买家退回 status = 1，courierStatus = 2
 *
 * E. 已同意退货退款，待商家收件查验 status  = 5 或 （status = 1, courierStatus = 3）
 *
 * F. 拒绝退款，status = 2
 *
 * G. 商家关闭：status = 3
 *
 * H. 用户取消：status = 4
 *
 * I. 售后完成：status = 6
 */
export const computedAfterSaleStatus = (options: {
  type: number
  status: number
  courierStatus: number
  refund: number
}) => {
  const { type, status, courierStatus, refund } = options
  // A. 申请仅退款，待商家处理  status = 0 ，type = 1
  if (status === ORDER_AFTER_SALES_STATUS_PENDING && type === AFTER_SALE_TYPE_REFUND_ONLY) {
    return 'A'
  }

  // B. 申请退货退款，待商家处理 status = 0， type = 2
  if (status === ORDER_AFTER_SALES_STATUS_PENDING && type === AFTER_SALE_TYPE_REFUND) {
    return 'B'
  }

  // C. 已同意仅退款，待退款 status = 1，refund = 0
  if (status === ORDER_AFTER_SALES_STATUS_ACCESS && refund === 0) {
    return 'C'
  }

  // D. 已同意退货退款，待买家退回 status = 1，courierStatus = 2
  if (status === ORDER_AFTER_SALES_STATUS_ACCESS && courierStatus === AFTER_SALE_EXPRESS_STATUS_PENDING) {
    return 'D'
  }

  // E. 已同意退货退款，待商家收件查验 status  = 5 或 （status = 1, courierStatus = 3）
  if (
    status === ORDER_AFTER_SALES_STATUS_PENDING_RECEIVE ||
    (status === ORDER_AFTER_SALES_STATUS_ACCESS && courierStatus === AFTER_SALE_EXPRESS_STATUS_SHIPPED)
  ) {
    return 'E'
  }

  // F. 拒绝退款，status = 2
  if (status === ORDER_AFTER_SALES_STATUS_REFUSE) {
    return 'F'
  }

  // G. 商家关闭：status = 3
  if (status === ORDER_AFTER_SALES_STATUS_CLOSE) {
    return 'G'
  }

  // H. 用户取消：status = 4
  if (status === ORDER_AFTER_SALES_STATUS_CANCEL) {
    return 'H'
  }

  // I. 售后完成：status = 6
  if (status === ORDER_AFTER_SALES_STATUS_COMPLETE) {
    return 'I'
  }

  return null
}
