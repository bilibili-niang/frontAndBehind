import { usePagination } from '@anteng/core'
import { defineComponent, onMounted } from 'vue'
import { $getDiscountCouponReceiveList } from '../../../../api/discount-coupon'
import Promotion from '../../detail/promotion'
import './style.scss'
import { DiscountCouponScene } from '../../../../constants/discount-coupon'

export default defineComponent({
  props: {
    groupId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const pagination = usePagination({
      requestHandler: params => {
        return $getDiscountCouponReceiveList({
          ...params,
          groupId: props.groupId,
          showStatus: true
        })
      }
    })

    const { data, fetchData } = pagination

    onMounted(() => {
      fetchData()
    })

    return () => {
      if (!(data.value.length > 0)) return null
      return (
        <div class="goods-group-coupon-receiver">
          <div class="goods-group-coupon-receiver__title">以下商品适用：</div>
          <Promotion pagination={pagination} scene={DiscountCouponScene.goodsGroup} goodsGroupId={props.groupId} />
        </div>
      )
    }
  }
})
