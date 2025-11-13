import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { Graph } from '@antv/g6'
import request from '../../api/request'

type UseG6GraphOptions = {
  title?: string
  requestURL?: string
  customRequest?: (params?: any) => Promise<any>
  height?: number
  build: (graph: Graph, data: any) => void
}

const useG6Graph = (options: UseG6GraphOptions) => {
  const el = ref<HTMLDivElement | null>(null)
  const instance = ref<Graph | null>(null)
  const dataRef = ref<any>(null)
  const refresh = (params?: any) => {
    const p = options.customRequest
      ? options.customRequest(params)
      : request({ url: options.requestURL as string, method: 'get', params })
    return p.then((res: any) => {
      dataRef.value = res?.data ?? res
      if (instance.value) options.build(instance.value, dataRef.value)
      return res
    })
  }
  const Comp = defineComponent({
    setup() {
      onMounted(() => {
        const height = options.height || 320
        instance.value = new Graph({
          container: el.value as HTMLDivElement,
          width: (el.value as HTMLDivElement).clientWidth || 600,
          height,
          autoFit: 'view'
        })
        refresh()
      })
      onBeforeUnmount(() => {
        instance.value?.destroy()
        instance.value = null
      })
      return () => <div style={{ width: '100%', height: `${options.height || 320}px` }} ref={el}></div>
    }
  })
  return { Comp, refresh, data: dataRef, instance }
}

export default useG6Graph