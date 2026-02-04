import { type ContextMenuItem } from '@pkg/core'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
// 移除接口相关逻辑与快照依赖，保留画布与缩放逻辑

const useEditorStore = defineStore('Editor', () => {
  const requestBaseURL = ref(import.meta.env.VITE_APP_REQUEST_BASE_URL)
  const setRequestBaseURL = (url: string) => (requestBaseURL.value = url)

  const pageId = ref<string | null>(null)
  const loading = ref(false)
  const failed = ref(false)
  const currentCanvas = ref<string | null>(null)

  // 已去除依赖路由的接口逻辑

  const DELAY = 300
  const setCurrentCanvas = (key?: string) => {
    loading.value = true
    failed.value = false
    if (!key) {
      currentCanvas.value = `PAGE_CREATE`
      pageId.value = null
      setTimeout(() => {
        loading.value = false
      }, DELAY)
      return
    }
    pageId.value = key
    currentCanvas.value = `PAGE_${key}`
    // 直接结束加载，避免调用不存在的接口
    setTimeout(() => {
      loading.value = false
    }, DELAY)
  }


  /** 画布宽度 */
  const containerWidth = ref<number | null>(null)
  /** 画布高度 */
  const containerHeight = ref<number | null>(null)
  /** 视图宽度（不含设备外框） */
  const viewWidth = ref(375)
  /** 视图高度（不含设备外框） */
  const viewHeight = ref(667)

  /** 视图缩放比例 */
  const scale = ref(1)
  watch(
    scale,
    () => {
      const rem = 1 * scale.value
      document.documentElement.style.fontSize = `${rem}px`
    },
    { immediate: true }
  )

  /** 自适应缩放比例 */
  const aspectFitScale = ref(1)
  /** 缩放方式：定值、自适应 */
  const scaleType = ref<'static' | 'reactive' | 'stretch'>('reactive')
  const isStretch = ref(false)

  const scaleTo = (value: number) => {
    scale.value = value
    scaleType.value = 'static'
  }
  /** 缩放选项 */
  const scaleOptions = computed<ContextMenuItem[]>(() => {
    return [
      ...[0.5, 0.75, 1, 1.25, 1.5, 2].map((item) => {
        return {
          key: `scale_${item}`,
          title: `${item * 100}%`,
          handler: () => {
            scaleTo(item)
          },
          checked: scaleType.value === 'static' && scale.value === item
        }
      }),
      {
        key: 'auto',
        title: `自适应(${Math.round(aspectFitScale.value * 100)}%)`,
        value: 'auto',
        handler: () => {
          scaleType.value = 'reactive'
          isStretch.value = false
          resize(containerWidth.value!, containerHeight.value!)
        },
        checked: scaleType.value === 'reactive'
      },
      {
        key: 'stretch',
        title: '自适应高度',
        value: 'stretch',
        divider: true,
        handler: () => {
          if (scaleType.value === 'reactive') {
            return
          }
          isStretch.value = !isStretch.value
        },
        disabled: scaleType.value === 'reactive',
        checked: isStretch.value
      }
    ]
  })

  /** 视图reize */
  const resize = (width: number, height: number) => {
    containerWidth.value = width
    containerHeight.value = height
    const padding = 48
    const fitWidth = width - padding
    const fitHeight = height - padding
    aspectFitScale.value =
      Math.floor(Math.min(fitWidth / viewWidth.value, fitHeight / viewHeight.value) * 100) / 100
    if (scaleType.value === 'reactive') {
      scale.value = aspectFitScale.value
    }
  }

  return {
    requestBaseURL,
    setRequestBaseURL,
    loading,
    failed,
    pageId,
    currentCanvas,
    setCurrentCanvas,
    containerWidth,
    containerHeight,
    viewWidth,
    viewHeight,
    scale,
    scaleType,
    isStretch,
    resize,
    scaleOptions
  }
})

export default useEditorStore
