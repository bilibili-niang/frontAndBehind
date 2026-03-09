import { defineComponent } from 'vue'
import './style.scss'
import './icon.scss'

export default defineComponent({
  name: 'ice-icon',
  props: {
    name: {
      type: String,
      required: true
    }
  },
  setup(props, { slots }) {
    return () => {
      return <div class={['ice-icon iconfont icon', `icon-${props.name}`]}>{slots.default?.()}</div>
    }
  }
})
