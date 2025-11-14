import { eventCenter, useRouter } from '@tarojs/taro'
import { onUnmounted } from 'vue'

export const onPageShow = (callback: () => void) => {
  const router = useRouter()
  eventCenter.on(router.onShow, callback)
  onUnmounted(() => {
    eventCenter.off(router.onShow, callback)
  })
}

export const onPageHide = (callback: () => void) => {
  const router = useRouter()
  eventCenter.on(router.onHide, callback)
  onUnmounted(() => {
    eventCenter.off(router.onHide, callback)
  })
}
