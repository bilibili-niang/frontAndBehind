import { IGoodsDetail } from '../api/goods/types'
import {
  COMMON_STATUS_OFF,
  COMMON_STATUS_ON,
  GOODS_USABLE_TIME_OPENING,
  GOODS_USABLE_TIME_RANGE,
  GOODS_VALID_TIME_DURATION,
  GOODS_VALID_TIME_RANGE
} from '../constants'
import { formatDate } from '@pkg/utils'

/** 商品有效期文案 */
export const calcGoodsValidTimeText = (detail: IGoodsDetail) => {
  if (detail?.expireType === GOODS_VALID_TIME_RANGE)
    return `${formatDate(detail.expireStartAt || '')} ～ ${formatDate(detail.expireEndAt || '')}`
  if (detail?.expireType === GOODS_VALID_TIME_DURATION) return `自购买后 ${detail.expireDays} 天内有效`
  return '未知，请联系客服询问'
}

export const calcGoodsUsableTimeText = (detail: IGoodsDetail) => {
  if (detail?.availableDate === GOODS_USABLE_TIME_OPENING) {
    return ['营业时间内可用']
  } else if (detail?.availableDate === GOODS_USABLE_TIME_RANGE) {
    return [`${detail.availableDateStartAt || ''} ～ ${detail.availableDateEndAt || ''}`]
  }
  return ['未知，请联系客服询问']
}

const weekMap = [
  { label: '一', value: 1 },
  { label: '二', value: 2 },
  { label: '三', value: 3 },
  { label: '四', value: 4 },
  { label: '五', value: 5 },
  { label: '六', value: 6 },
  { label: '日', value: 7 }
]
export const calcGoodsUnusableTimeText = (detail: IGoodsDetail) => {
  const list: string[] = []
  if (!detail || detail.unavailableDate === COMMON_STATUS_OFF) {
    return list
  }
  if (detail.unavailableDateWeekday?.length > 0) {
    list.push(
      `每周 ${detail.unavailableDateWeekday.map(i => weekMap.find(day => day.value === i)?.label).join('、')} 不可用；`
    )
  }
  if (detail.unavailableDateHoliday === COMMON_STATUS_ON) {
    list.push('法定节假日不可用；')
  }
  if (detail.unavailableDateRange === COMMON_STATUS_ON) {
    list.push(`期间内不可用：${detail.unavailableDateStartAt} \n\t\t\t ～ ${detail.unavailableDateEndAt}`)
  }
  return list
}
