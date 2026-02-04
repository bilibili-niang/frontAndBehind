import { BasePage } from '@pkg/core'
import { defineComponent, ref } from 'vue'
import Deck from './index'

export default defineComponent({
  props: {
    pageId: {
      type: String,
      required: true
    },
    action: {
      type: Object
    }
  },
  setup(props) {
    const scrollTop = ref(0)
    const onScroll = (e: any) => {
      scrollTop.value = e.detail.scrollTop
    }
    return () => {
      return (
        <BasePage navigator={null} useScrollView scrollView={{ onScroll }}>
          <Deck pageId={props.pageId} action={props.action} scrollTop={scrollTop.value} />
        </BasePage>
      )
    }
  }
})
