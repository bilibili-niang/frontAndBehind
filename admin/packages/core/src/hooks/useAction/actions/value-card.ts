import { defineAction, useCommonSelector } from '@pkg/core'
import ValueCardList from '../../../views/valueCard/list'

const ValueCardSelector = useCommonSelector({
  widget: ValueCardList
})

/** 储值卡列表 */
const valueCardList = defineAction({
  key: 'value-card-list',
  title: '储值卡列表'
})

/** 储值卡列表 */
const valueCardDetail = defineAction({
  key: 'value-card-detail',
  title: '储值卡详情',
  schema: {
    type: 'object',
    properties: {
      target: {
        title: '选择储值卡',
        type: 'object',
        widget: ValueCardSelector
      }
    }
  }
})

/** 我的储值卡 */
const valueCardMine = defineAction({
  key: 'value-card-mine',
  title: '我的储值卡'
})

/** 储值卡订单列表 */
const valueCardOrderList = defineAction({
  key: 'value-card-order-list',
  title: '储值卡订单列表'
})

/** 储值卡兑换 */
const valueCardExchange = defineAction({
  key: 'value-card-exchange',
  title: '储值卡兑换'
})

export const valueCardActions = {
  valueCardList,
  valueCardDetail,
  valueCardMine,
  valueCardOrderList,
  valueCardExchange
} as const
