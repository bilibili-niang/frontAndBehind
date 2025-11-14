import { defineComponent } from 'vue'
import { useRouter } from '@tarojs/taro'
import { BasePage, WebView } from '@anteng/core'

export default defineComponent({
  name: 'custom-page',
  setup() {
    const router = useRouter()
    return () => {
      if (router.params.url) {
        return <WebView src={decodeURIComponent(router.params.url)} />
      }
      return (
        <BasePage class="custom-page">
          <div>链接打开失败</div>
        </BasePage>
      )
    }
  }
})
