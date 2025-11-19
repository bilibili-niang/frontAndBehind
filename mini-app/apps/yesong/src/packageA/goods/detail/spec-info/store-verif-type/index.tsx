/**
 * 门店核销类型商品规格列表
 */

import { Icon } from '@anteng/ui'
import { computed, defineComponent, ref } from 'vue'
import './style.scss'
import { useGoodsDetailStore } from '../../store'
import { storeToRefs } from 'pinia'
import { Image } from '@tarojs/components'
import { usePreviewImages } from '@anteng/core'
import { useGoodsSkuModal } from '../../../../../hooks'
import { navigateToOrderPay } from '../../../../../router'
import { ORDER_ORIGIN_DETAIL } from '../../../../../constants'
import { clamp } from 'lodash-es'
import useGoodsSkuDetials from '../useGoodsSkuDetails'

export default defineComponent({
  setup() {
    const goodsDetailStore = useGoodsDetailStore()
    const { goodsDetail, goodsSkus } = storeToRefs(goodsDetailStore)
    const sortedGoodsSkus = computed(() => {
      //仅显示可购买的，最多5个，如果无可购买显示3个
      let visibleCount = isFold.value
        ? clamp(goodsSkus.value.filter(item => !item.$soldOut).length, 0, 5)
        : goodsSkus.value.length
      visibleCount = visibleCount === 0 ? 3 : visibleCount
      return goodsSkus.value
        .slice(0)
        .sort((a, b) => {
          return (b.$soldOut ? 0 : 1) - (a.$soldOut ? 0 : 1)
        })
        .slice(0, visibleCount)
    })
    const isFold = ref(true)

    const onSkuClick = (sku: (typeof goodsSkus.value)[number]) => {
      useGoodsSkuDetials({
        goodsId: goodsDetail.value!.id,
        currentSkuId: sku.id
      })
    }

    const onBuyClick = (sku: (typeof goodsSkus.value)[number]) => {
      const { close } = useGoodsSkuModal({
        skus: goodsSkus.value,
        selectedSkuId: sku.id,
        defaultImage: goodsDetail.value?.coverImages?.[0],
        minCount: goodsDetail.value?.limitNumMin,
        maxCount: goodsDetail.value?.limitNumMax,
        onConfirm: data => {
          navigateToOrderPay({
            origin: ORDER_ORIGIN_DETAIL,
            goods: {
              gid: goodsDetailStore.goodsId,
              sid: data.id,
              count: data.count
            }
          }).finally(close)
        }
      })
    }

    return () => {
      return (
        <div class="goods-store-verif-type-spec">
          <div class="title">
            请选择规格
            <div
              class="more"
              onClick={() => {
                onSkuClick(sortedGoodsSkus.value?.[0])
              }}
            >
              规格详情
              <Icon name="right" />
            </div>
          </div>
          {sortedGoodsSkus.value?.map(item => {
            const imageURL = item.$image
            return (
              <div class="spec-item">
                <div
                  class="spec-item__image"
                  onClick={() => {
                    imageURL &&
                      usePreviewImages({
                        urls: [imageURL]
                      })
                  }}
                >
                  <Image class="image" mode="aspectFill" src={imageURL!} />
                </div>
                <div
                  class="spec-item__info"
                  onClick={() => {
                    onSkuClick(item)
                  }}
                >
                  <div class="spec-item__name">
                    <div class="text">{item.$name}</div>
                    <Icon name="right" />
                  </div>
                  <div class="spec-item__price number-font">
                    <div class="yen">&yen;</div>
                    {item.price}
                    {item.underlinePrice > item.price && (
                      <div class="spec-item__list-price">&yen;{item.underlinePrice}</div>
                    )}
                  </div>
                </div>
                {item.$soldOut ? (
                  <div class="spec-item__action disabled">已售罄</div>
                ) : (
                  <div class="spec-item__action" onClick={() => onBuyClick(item)}>
                    立即购买
                  </div>
                )}
              </div>
            )
          })}
          {sortedGoodsSkus.value.length > 3 && isFold.value && (
            <div
              class="unfold-btn"
              onClick={() => {
                isFold.value = false
              }}
            >
              展开更多
              <Icon name="down" />
            </div>
          )}
        </div>
      )
    }
  }
})
