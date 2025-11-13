import { PropType, defineComponent } from 'vue'
import './style.scss'
import { DeckComponent } from '../../../stores/canvas'

export { default as manifest } from './manifest'

type RichTextComp = {
  content: string
}

export default defineComponent({
  name: 'C_RichText',
  props: {
    comp: {
      type: Object as PropType<DeckComponent<RichTextComp>>,
      required: true
    },
    config: {
      type: Object as PropType<RichTextComp>,
      required: true
    }
  },
  setup(props) {
    return () => {
      if (!props.config?.content) {
        return (
          <div class="flex-center" style="height:100px;font-size:0.8em">
            无内容，请编辑富文本内容
          </div>
        )
      }

      return <div v-html={props.config?.content}></div>
    }
  }
})
