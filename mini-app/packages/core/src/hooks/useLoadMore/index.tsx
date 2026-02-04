import { uuid } from '@pkg/utils'
import Taro from '@tarojs/taro'
import { onUnmounted, ref, watch } from 'vue'

export const useLoadMore = (options?: {}) => {
  const loaderRef = ref<HTMLElement>()
  const loaderId = `load_more_${uuid()}`
  let _trigger = () => {}

  const onLoadMore = (trigger: () => void) => {
    _trigger = trigger
  }

  watch(
    () => loaderRef.value,
    () => {
      if (loaderRef.value) {
        init()
      }
    },
    { immediate: true }
  )

  const init = () => {
    if (process.env.TARO_ENV === 'h5') {
      const observer = new IntersectionObserver(e => {
        if (e[0].isIntersecting) {
          _trigger()
        }
      })

      observer.observe(loaderRef.value!)

      onUnmounted(() => {
        observer.disconnect()
      })
    } else {
      const observer = Taro.createIntersectionObserver(Taro.getCurrentInstance().page!, {
        thresholds: [0],
        observeAll: true
      })

      observer.relativeToViewport({ bottom: 0, top: 0 }).observe(`#${loaderId}`, e => {
        if (e.intersectionRatio > 0) {
          _trigger()
        }
      })

      onUnmounted(() => {
        observer.disconnect()
      })
    }
  }

  // 小程序里至少需要有1px尺寸才能触发
  const LoadMoreAnchor = () => (
    <div style="height:10vh;pointer-events:none;margin-top:-10vh;" key={loaderId} ref={loaderRef} id={loaderId}></div>
  )

  return {
    onLoadMore,
    LoadMoreAnchor
  }
}
