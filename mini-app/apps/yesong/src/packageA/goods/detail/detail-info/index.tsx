import { RichText } from '@anteng/core'
import { defineComponent, PropType } from 'vue'
import './style.scss'
import { IGoodsDetail } from '../../../../api/goods/types'

export default defineComponent({
  name: 'GoodsDetailInfo',
  props: {
    goodsDetail: {
      type: Object as PropType<IGoodsDetail>,
      required: true
    }
  },
  setup(props) {
    return () => {
      if (!props.goodsDetail?.detail) {
        return null
      }
      return (
        <div class="goods-detail-info">
          <RichText class="goods-detail-info__content" content={props.goodsDetail.detail} />
        </div>
      )
    }
  }
})
