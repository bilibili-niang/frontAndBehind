import { defineComponent, PropType } from 'vue'
import './style.scss'
import { Icon } from '@anteng/ui'
import { useReceiveCoupon } from '../../../../hooks'
import { formatPrice } from '@anteng/utils'
import { usePagination } from '@anteng/core'
import { IDiscountCoupon } from '../../../../api/discount-coupon/types'
import { DiscountCouponScene } from '../../../../constants/discount-coupon'

export default defineComponent({
  name: 'GoodsDetailPromotion',
  props: {
    pagination: {
      type: Object as PropType<ReturnType<typeof usePagination<IDiscountCoupon>>>,
      required: true
    },
    scene: {
      type: Number as PropType<DiscountCouponScene>,
      default: DiscountCouponScene.goodsDetail
    },
    goodsId: String,
    goodsGroupId: String
  },
  setup(props) {
    const pagination = props.pagination

    const { data } = pagination

    return () => {
      if (data.value.length === 0) {
        return null
      }
      return (
        <div
          class="goods-detail-promotion"
          onClick={() => {
            useReceiveCoupon(pagination, {
              scene: props.scene,
              goodsId: props.goodsId,
              goodsGroupId: props.goodsGroupId
            })
          }}
        >
          <div class="coupon-list">
            {data.value.map(item => {
              const v = formatPrice(item.discountAmount / 100)
              if (item.thresholdAmount > 0) {
                return (
                  <div class="coupon-item number-font">
                    满 {formatPrice(item.thresholdAmount / 100)} 减 {v}
                  </div>
                )
              } else if (item.thresholdAmount === 0) {
                return <div class="coupon-item">{v} 元无门槛</div>
              }
              return <div class="coupon-item">{v} 元券</div>
            })}
          </div>
          <div class="get-btn">
            优惠
            <Icon name="right" />
          </div>
        </div>
      )
    }
  }
})
