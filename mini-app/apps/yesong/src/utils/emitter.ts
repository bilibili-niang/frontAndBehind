import { emitter } from '@pkg/core'

export const EMITTER_ORDER_REFRESH = Symbol('EMITTER_ORDER_ITEM_REFRESH')

/** 触发订单数据刷新，一般用于对订单进行操作后，刷新订单数据 */
export const triggerOrderItemRefresh = (orderId: string, delay = 300) => {
  setTimeout(() => {
    emitter.trigger(EMITTER_ORDER_REFRESH, orderId)
  }, delay)
}
