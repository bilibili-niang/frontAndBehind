import { maxBy, minBy } from 'lodash-es'
import { computed, isRef, Ref } from 'vue'
import { IGoodsDetail } from '../api/goods/types'

/** 购买数量限制 */
export const useGoodsLimit = (goodsDetail: IGoodsDetail | Ref<IGoodsDetail>, skuId: string | Ref<string>) => {
  const detail = isRef(goodsDetail) ? goodsDetail.value : goodsDetail

  type Limit = {
    value: number
    message: string
  }

  const min = detail.limitNumMin > 1 ? detail.limitNumMin : 1
  const limitMinScenes: Limit[] = [
    { value: 1, message: '最少购买 1 件' },
    { value: min, message: `最少购买 ${min} 件` }
  ]

  /** 最小购买量 */
  const limitMin = computed(() => {
    return maxBy(limitMinScenes, o => o.value)
  })

  const targetSku = detail.goodsSkus.find(item => item.id === (isRef(skuId) ? skuId.value : skuId))

  const max = detail.limitNumMax > 1 ? detail.limitNumMax : Infinity
  const limitMaxScenes: Limit[] = [
    { value: targetSku?.stock ?? Infinity, message: '超出库存范围' },
    { value: max, message: `最多购买 ${max} 件` }
  ]

  /** 最大购买量：库存量 & 设置最大限制 */
  const limitMax = computed(() => {
    return minBy(limitMaxScenes, o => o.value)
  })
  return {
    limitMin,
    limitMax
  }
}
