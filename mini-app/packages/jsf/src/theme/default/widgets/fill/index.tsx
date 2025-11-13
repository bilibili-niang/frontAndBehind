import { defineComponent } from 'vue'
import { CommonWidgetPropsDefine } from '../../../../types/widget'

export default defineComponent({
  name: 'w_fill',
  props: CommonWidgetPropsDefine,
  setup() {
    return () => {
      return <div class="w_fill"></div>
    }
  }
})
