import { defineComponent, PropType } from 'vue'
import './style.scss'

export const ExceptionView = defineComponent({
  name: 'ExceptionView',
  props: {
    image: String,
    title: String,
    desc: String,
    type: {
      type: String as PropType<'500' | '404'>,
      default: '404'
    }
  },
  setup(props) {
    return () => {
      return <div class="tqy-exception-view">not found</div>
    }
  }
})
