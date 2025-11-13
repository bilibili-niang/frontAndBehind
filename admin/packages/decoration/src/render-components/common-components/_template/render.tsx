import { defineComponent, PropType } from 'vue'
import './style.scss'
import { DeckComponent } from '../../../stores/canvas'

export { default as manifest } from './manifest'

export default defineComponent({
  props: {
    comp: {
      type: Object as PropType<DeckComponent<{}>>,
      required: true
    },
    config: {
      type: Object as PropType<{}>,
      required: true
    }
  },
  setup(props) {

    return () => {
      return (
        <div class="c_template">
        </div>
      )
    }
  }
})
