import { Spin } from '@anteng/core'
import { defineComponent } from 'vue'
import './style.scss'

export default defineComponent({
  name: '',
  setup() {
    return () => {
      return (
        <div class="order-detail-skeleton">
          <Spin />
        </div>
      )
    }
  }
})
