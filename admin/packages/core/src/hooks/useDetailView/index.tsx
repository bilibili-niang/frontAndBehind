import { Empty, Skeleton } from '@pkg/ui'
import { onMounted, ref } from 'vue'
import type { ResponseData } from '../../api/request'
import { useComputedValue, type ComputedValue } from '../useComputedValue'

export const useDetailView = (options: {
  id: ComputedValue<any>
  requestHandler: <T>(id: string) => Promise<ResponseData<T>>
}) => {
  const id = useComputedValue(options.id)

  const detail = ref()
  const loading = ref(false)
  const getDetail = () => {
    loading.value = true
    options
      .requestHandler(id.value)
      .then((res) => {
        detail.value = res.data
      })
      .finally(() => {
        loading.value = false
      })
  }

  onMounted(() => {
    getDetail()
  })

  const DetailView = (props, { slots }) => {
    if (loading.value) {
      return (
        <>
          <Skeleton active />
          <Skeleton />
          <Skeleton />
        </>
      )
    }

    if (!detail.value) {
      return <Empty />
    }

    return slots.default?.()
  }

  return {
    DetailView,
    getDetail,
    detail,
    loading
  }
}
