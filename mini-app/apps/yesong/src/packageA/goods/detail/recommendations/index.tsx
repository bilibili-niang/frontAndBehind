import RecommendGoods from '../../../../components/recommend-goods'
import { defineComponent } from 'vue'
import './style.scss'

export default defineComponent({
  name: 'GoodsDetailRecommendations',
  setup() {
    return () => {
      return (
        <div class="goods-detail-recs">
          <div class="main-title">猜你喜欢</div>
          <RecommendGoods />
        </div>
      )
    }
  }
})
