import { PropType, defineComponent } from 'vue'
import './style.scss'
import { DeckComponent } from '../../stores/canvas'

export { default as manifest } from './manifest'

export default defineComponent({
  name: 'C_Template',
  props: {
    comp: {
      type: Object as PropType<DeckComponent<{}>>,
      required: true
    }
  },
  setup() {
    return () => {
      return <div class="c_template"></div>
    }
  }
})
