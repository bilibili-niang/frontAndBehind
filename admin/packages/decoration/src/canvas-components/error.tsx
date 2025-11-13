import { defineComponent } from 'vue'

export default defineComponent({
  name: 'c_component-loading',
  setup() {
    return () => {
      return <div class="c_component-loading">组件加载失败</div>
    }
  }
})
