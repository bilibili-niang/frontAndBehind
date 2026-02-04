import { defineComponent, ref } from 'vue'
import Custom from './tab-pages/deck'
import { useRouter } from '@tarojs/taro'
import { BasePage, useShareAppMessage } from '@pkg/core'

definePageConfig({
  navigationStyle: 'custom',
  enableShareAppMessage: true
})

export default defineComponent({
  name: 'custom-page',
  setup() {
    const router = useRouter()
    const scrollTop = ref(0)
    const onScroll = (e: any) => {
      scrollTop.value = e.detail.scrollTop
    }

    const enableShareAppMessage = ref(true)
    const shareType = ref('default')
    const sharePayload = ref()

    const onCustomPageLoad = payload => {
      shareType.value = payload.payload.page.basic.shareType
      enableShareAppMessage.value = payload.payload.page.basic.shareType !== 'none'
      const { title, image } = payload.payload.page.basic.shareConfig
      sharePayload.value = {
        title: title,
        imageUrl: image.url
      }
    }

    useShareAppMessage(() => {
      if (shareType.value === 'default') {
        return undefined
      }
      return sharePayload.value
    })

    return () => {
      return (
        <BasePage
          navigator={null}
          class="custom-page"
          useScrollView
          scrollView={{ onScroll }}
          enableGlobalShare={false}
          enableShareAppMessage={enableShareAppMessage.value}
        >
          <Custom pageId={router.params.id!} scrollTop={scrollTop.value} onLoad={onCustomPageLoad} />
        </BasePage>
      )
    }
  }
})
