import { uuid } from '@anteng/core'
import { defineComponent, onDeactivated, onMounted, onUnmounted } from 'vue'
import { DeckApp } from '@anteng/decoration'
import './style.scss'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'CommonDeckPage',
  setup() {
    const route = useRoute()
    const pageId = route.params.id as string
    const key = pageId ?? uuid()

    onMounted(() => {
      console.log(`%c 装修开启：${key}`, 'color:#2ecc71')
    })

    onUnmounted(() => {
      console.log(`%c 装修关闭：${key}`, 'color:#2ecc71')
    })

    onDeactivated(() => {
      console.log(`%c 装修暂停：${key}`, 'color:#cc2e2e')
    })

    return () => {
      return (
        <div class="store-deck-page">
          <DeckApp key={key} pageId={pageId} />
        </div>
      )
    }
  }
})
