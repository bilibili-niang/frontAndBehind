import { Spin } from '@pkg/core'
import { defineComponent } from 'vue'
import './style.scss'

export default defineComponent({
  name: 'GoodsDetailSkleton',
  setup() {
    return () => {
      return (
        <div class="goods-detail-skeleton">
          <Spin />
        </div>
      )
    }
  }
})
