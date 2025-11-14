import { computed, defineComponent, PropType } from 'vue'
import './style.scss'
import { Icon } from '@anteng/ui'
import { useGoodsSkuModal, useGoodsSku } from '../../../../hooks'
import { Image } from '@tarojs/components'
import { IGoodsDetail } from '../../../../api/goods/types'
import { SkuItem } from '../../../../hooks/useGoodsSku/utils'
import { navigateToOrderPay } from '../../../../router'
import { GOODS_TYPE_STORE_VERIFICATION } from '../../../../constants'
import StoreVerifType from './store-verif-type'
import { useCartStore } from '../../../../stores'
import { buildImgUrl } from '../../../../utils'

export default defineComponent({
  name: 'GoodsDetailSpecInfo',
  props: {
    goodsDetail: {
      type: Object as PropType<IGoodsDetail>,
      required: true
    }
  },
  setup(props) {
    const defaultImage = props.goodsDetail.coverImages[0]

    const onClick = () => {
      const { close } = useGoodsSkuModal({
        skus: props.goodsDetail.goodsSkus as any,
        defaultImage: defaultImage,
        minCount: props.goodsDetail.limitNumMin ?? 1,
        maxCount: props.goodsDetail.limitNumMax,
        actions: [
          {
            text: '加入购物车',
            type: 'minor',
            onClick: data => {
              useCartStore()
                .addItem({
                  goodsId: props.goodsDetail.id,
                  goodsSkuId: data.id,
                  count: data.count
                })
                .finally(close)
            }
          },
          {
            text: '立即购买',
            type: 'primary',
            onClick: data => {
              close()
              navigateToOrderPay({
                goods: {
                  gid: props.goodsDetail.id,
                  sid: data.id,
                  count: data.count
                }
              })
            }
          }
        ]
      })
    }

    const { skus, specs, images, matchedSkus } = useGoodsSku({
      skus: props.goodsDetail.goodsSkus as any,
      defaultImage: defaultImage,
      minCount: 1
    })

    const result = computed<SkuItem | null>(() => {
      return matchedSkus.value.length === 1 ? matchedSkus.value[0] : null
    })

    return () => {
      if (props.goodsDetail.type === GOODS_TYPE_STORE_VERIFICATION) {
        return (
          <div class="goods-detail-spec-info">
            <StoreVerifType />
          </div>
        )
      }
      return (
        <div class="goods-detail-spec-info" onClick={onClick}>
          <div class="current-selected">
            <span class="current-selected-label">已选</span>
            <span class="current-selected-value">
              {result.value ? result.value.specs.map(item => item.v).join('／') : '请选择'}
            </span>
            <Icon name="right" />
          </div>
          {images.value.length > 1 && (
            <div class="spec-optional-list">
              <div class="spec-thumbnails">
                {images.value.map(image => {
                  return image ? (
                    <div class="spec-thumbnail-item">
                      <Image class="image" src={buildImgUrl()} mode="aspectFill" />
                    </div>
                  ) : (
                    <div class="spec-thumbnail-item">暂无图片</div>
                  )
                })}
              </div>
              <div class="spec-optional-count">
                共 {images.value.length} 种{specs.value[0].name}可选
              </div>
            </div>
          )}
        </div>
      )
    }
  }
})
