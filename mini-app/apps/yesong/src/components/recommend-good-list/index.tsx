import { defineComponent } from 'vue'

export default defineComponent({
  name: 'RecommendGoodList',
  props: {
    // 组件类型 goodsDetail pay shop
    comType: {
      type: String,
      required: true,
      default: 'goodsDetail'
    }
  },
  setup(props) {
    return () => {
      return (
        <div class="recommend-good-list">
          {props.comType === 'goodsDetail' && <div class="guess-you-like">猜你喜欢</div>}

          <div class="hot-items">热门商品</div>

          <div class="recently-hot">近期热销</div>
        </div>
      )
    }
  }
})
