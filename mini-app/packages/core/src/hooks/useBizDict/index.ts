import { computed } from 'vue'
import { $getBizDict } from '../../api'
import usePagination from '../usePagination'
import { useAppStore } from '../../stores'

const cacheData: Record<string, ReturnType<typeof usePagination>> = {}

export const useBizDict = (code: string) => {
  const merchantId = useAppStore().merchantId

  const pagination =
    cacheData[code]?.[merchantId] ||
    usePagination({
      requestHandler: params => {
        return $getBizDict({
          ...params,
          code
        })
      }
    })

  if (!cacheData[code]?.[merchantId]) {
    cacheData[code] = cacheData[code] || {}
    cacheData[code][merchantId] = pagination
    pagination.fetchData()
  }

  return {
    ...pagination,
    options: computed(() => {
      return pagination.data.value.map((item: any) => {
        return {
          label: item.dictValue,
          title: item.dictValue,
          value: item.dictKey || item.id
        }
      })
    })
  }
}
