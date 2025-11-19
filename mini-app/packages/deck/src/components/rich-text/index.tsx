import { PropType, defineComponent } from 'vue'

import { RichText } from '@anteng/core'
import { DeckComponentConfig } from '../types'

export default defineComponent({
  name: 'd_rich-text',
  props: {
    config: {
      type: Object as PropType<
        DeckComponentConfig<{
          content: string
        }>
      >,
      required: true
    }
  },
  setup(props) {
    return () => {
      return <RichText content={props.config.content}></RichText>
    }
  }
})
