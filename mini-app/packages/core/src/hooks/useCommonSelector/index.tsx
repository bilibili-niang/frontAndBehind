import { ref } from 'vue'
import useModal from '../useModal'
import usePagination from '../usePagination'
import { Search } from '@pkg/ui'
import './style.scss'
import { EmptyStatus } from '../../../lib'

export const useCommonSelector = (options: {
  title: string
  requestHandler: Parameters<typeof usePagination>[0]['requestHandler']
  customItemRender?: (item: any) => any
  /** 默认空，不显示搜索 */
  searchKey?: string
  /** 默认 name */
  labelKey?: string
  /** 默认 id */
  valueKey?: string
  /** 需要搜索关键词才加载 */
  needSearch?: boolean

  onSelect: (item: any) => void
}) => {
  const labelKey = options.labelKey ?? 'name'
  const valueKey = options.valueKey ?? 'id'

  const { data, fetchData, refreshData, CommonPaginationStatus } = usePagination({
    requestHandler: params => {
      const _params = { ...params }
      if (options.searchKey && keywords.value) {
        _params[options.searchKey] = keywords.value
      }
      return options.requestHandler(_params)
    }
  })

  const refresh = () => {
    data.value = []
    if (options.needSearch && !keywords.value) {
      return void 0
    }
    refreshData()
  }

  const keywords = ref('')
  const onSearch = (k: string) => {
    keywords.value = k
    refresh()
  }

  const Item = (props: { value: any }) => {
    return (
      options.customItemRender?.(props.value) || (
        <div class="use-common-selector__item-default">{props.value?.[labelKey]}</div>
      )
    )
  }

  const onSelect = (item: any) => {
    options.onSelect(item)

    modal.close()
  }

  const getData = () => {
    if (options.needSearch && !keywords.value) {
      return void 0
    }
    fetchData()
  }

  getData()

  const modal = useModal({
    title: options.title,
    height: 'max',
    padding: 0,
    backgroundColor: '#f5f6fa',
    content: () => {
      return (
        <div class="use-common-selector">
          <div class="use-common-selector__header">
            <Search class="search" value={keywords.value} placeholder="输入关键字搜索" onSearch={onSearch} />
          </div>
          {options.needSearch && !keywords.value ? (
            <div class="use-common-selector__content">
              <EmptyStatus description="请输入关键字搜索" />
            </div>
          ) : (
            <div class="use-common-selector__content">
              {data.value.map(item => {
                return (
                  <div
                    class="use-common-selector__item"
                    onClick={() => {
                      onSelect(item)
                    }}
                  >
                    <Item value={item} />
                  </div>
                )
              })}
              <CommonPaginationStatus />
            </div>
          )}
        </div>
      )
    }
  })
}
