import { BasePage } from '@pkg/core'
import { defineComponent } from 'vue'
import './404.scss'

definePageConfig({
  navigationStyle: 'custom'
})

export default defineComponent({
  setup() {
    return () => {
      return (
        <BasePage>
          <div class="not-found-page">当前页面丢失了</div>
        </BasePage>
      )
    }
  }
})
