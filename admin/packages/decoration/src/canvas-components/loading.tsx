import { defineComponent } from 'vue'
import './loading.scss'

export default defineComponent({
  name: 'c_component-loading',
  setup() {
    return () => {
      return <div class="c_component-loading">组件加载中</div>
    }
  }
})
