import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import request from '../../api/request'
import { Spin } from '@pkg/ui'

type UseEChartsOptions = {
  config?: any
  height?: number
  requestURL?: string
  customRequest?: (params?: any) => Promise<any>
  build?: (data: any, instance: echarts.ECharts) => any
  autoHeight?: boolean
}

const useECharts = (options: UseEChartsOptions) => {
  const el = ref<HTMLDivElement | null>(null)
  const instance = ref<echarts.ECharts | null>(null)
  const dataRef = ref<any>(null)
  const loading = ref(false)
  const filterRef = ref<Record<string, any>>({})

  const setFilter = (payload: Record<string, any>) => {
    filterRef.value = { ...filterRef.value, ...payload }
  }

  const applyOption = () => {
    if (!instance.value) return
    const next = options.build ? options.build(dataRef.value, instance.value) : options.config || {}
    instance.value.setOption(next, true)
    try {
      requestAnimationFrame(() => instance.value?.resize())
    } catch {

    }
  }

  const refresh = (params?: any) => {
    const p = options.customRequest
      ? options.customRequest({ ...filterRef.value, ...params })
      : request({ url: options.requestURL as string, method: 'get', params: { ...filterRef.value, ...params } })
    loading.value = true
    return Promise.resolve(p)
      .then((res: any) => {
        dataRef.value = res?.data ?? res
        applyOption()
        return res
      })
      .finally(() => {
        loading.value = false
        try {
          requestAnimationFrame(() => instance.value?.resize())
        } catch {
        }
      })
  }

  const Chart = defineComponent({
    setup() {
      let ro: ResizeObserver | null = null
      let roParent: ResizeObserver | null = null
      let teTargets: HTMLElement[] = []
      let teHandler: ((e: Event) => void) | null = null
      const measureParentHeight = (container: HTMLDivElement) => {
        const tryGet = (el: HTMLElement | null) => (el ? el.getBoundingClientRect().height || el.clientHeight : 0)
        const p1 = container.parentElement as HTMLElement | null
        let h = tryGet(p1)
        if (!h || h <= 0) {
          const p2 = p1?.parentElement as HTMLElement | null
          h = tryGet(p2)
          if (!h || h <= 0) {
            const p3 = p2?.parentElement as HTMLElement | null
            h = tryGet(p3)
          }
        }
        return h
      }
      const findObserveTarget = (container: HTMLDivElement) => {
        const chain: (HTMLElement | null)[] = [
          container.parentElement as HTMLElement | null,
          (container.parentElement as HTMLElement | null)?.parentElement as HTMLElement | null,
          ((container.parentElement as HTMLElement | null)?.parentElement as HTMLElement | null)?.parentElement as HTMLElement | null
        ]
        for (const el of chain) {
          if (!el) continue
          const h = el.getBoundingClientRect().height || el.clientHeight
          if (h && h > 0) return el
        }
        return container.parentElement as HTMLElement | null
      }
      const observeTransitions = (container: HTMLDivElement) => {
        const chain: (HTMLElement | null)[] = [
          container.parentElement as HTMLElement | null,
          (container.parentElement as HTMLElement | null)?.parentElement as HTMLElement | null,
          ((container.parentElement as HTMLElement | null)?.parentElement as HTMLElement | null)?.parentElement as HTMLElement | null
        ]
        teTargets = chain.filter((x): x is HTMLElement => !!x)
        teHandler = () => instance.value?.resize()
        teTargets.forEach((t) => t.addEventListener('transitionend', teHandler as EventListener))
      }
      onMounted(() => {
        const height = options.height || 320
        const container = el.value as HTMLDivElement
        container.style.width = '100%'
        if (options.autoHeight !== false) {
          const ph = measureParentHeight(container)
          container.style.height = `${ph > 0 ? ph : height}px`
        } else {
          container.style.height = `${height}px`
        }
        instance.value = echarts.init(container)
        applyOption()
        refresh()
        const onResize = () => instance.value?.resize()
        window.addEventListener('resize', onResize)
        ;(instance.value as any).__onResize__ = onResize
        ro = new ResizeObserver(() => instance.value?.resize())
        ro.observe(container)
        if (options.autoHeight !== false) {
          const target = findObserveTarget(container)
          if (target) {
            roParent = new ResizeObserver(() => {
              const ph = measureParentHeight(container)
              if (ph > 0) container.style.height = `${ph}px`
              instance.value?.resize()
            })
            roParent.observe(target)
          }
        }
        observeTransitions(container)
        requestAnimationFrame(() => instance.value?.resize())
      })
      onBeforeUnmount(() => {
        const fn = (instance.value as any)?.__onResize__
        if (fn) window.removeEventListener('resize', fn)
        if (ro) {
          try {
            ro.disconnect()
          } catch {
          }
          ro = null
        }
        if (roParent) {
          try {
            roParent.disconnect()
          } catch {
          }
          roParent = null
        }
        if (teTargets.length && teHandler) {
          try {
            teTargets.forEach((t) => t.removeEventListener('transitionend', teHandler as EventListener))
          } catch {
          }
          teTargets = []
          teHandler = null
        }
        instance.value?.dispose()
        instance.value = null
      })
      return () => (
        <Spin spinning={loading.value}>
          <div ref={el}></div>
        </Spin>
      )
    }
  })

  return { Chart, refresh, data: dataRef, instance, setFilter }
}

export default useECharts
export const createEChartsWidget = (options: { title: string } & UseEChartsOptions) => {
  const api = useECharts(options)
  return { title: options.title, ...api }
}