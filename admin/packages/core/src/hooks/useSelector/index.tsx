import { Select, type SelectProps } from '@anteng/ui'
import { computed, onMounted, ref, type SetupContext, watch } from 'vue'
import type { RequestPagination, ResponsePaginationData } from '../../api/request'
import request from '../../api/request'
import usePagination from '../usePagination'
import { debounce, uniqBy } from 'lodash'

type ISelectorOptions = {
  requestURL?: string
  customRequest?: (params: RequestPagination) => ResponsePaginationData<any[]>
  labelKey?: string
  valueKey?: string
  searchKey?: string
  /** 懒加载，使用时才加载 */
  lazy?: boolean
  /* 是否监听值并获取数据,默认获取 */
  allowListen?: boolean
}

/*
 * @param config
 * @param config.requestURL 请求地址
 * @param config.customRequest 自定义请求方法
 * @param config.labelKey 标签字段
 * @param config.valueKey 值字段
 * @param config.searchKey 搜索字段
 * @param config.getAllAttributes 是否获取请求中的所有字段,会挂载在 attributes 上面
 * @param config.lazy 是否懒加载，使用时才加载
 * @returns Selector
 * */
export const useSelector = (config: ISelectorOptions) => {
  const valueRef = ref<any>()

  const fetchSpecData = () => {
    requestHandler({ [config.valueKey || 'id']: valueRef.value, size: 3000, current: 1 })
      .then((res) => {
        specData.value =
          (res.data.records || res.data)?.find((it: any) => it[config.valueKey || 'id'] == valueRef.value) ?? null
      })
      .catch((err) => {
        specData.value = null
      })
  }

  const debouncedFetchSpecData = debounce(fetchSpecData, 300)

  watch(
    () => valueRef.value,
    (v) => {
      if (config?.allowListen === false) {
        return void 0
      } else {
        debouncedFetchSpecData()
      }
    }
  )

  const options = computed<{ label: string; value: any }[]>(() => {
    const prependData =
      keywords.value ||
      (specData.value &&
        data.value.find((item: any) => item[config.valueKey || 'id'] === specData.value[config.valueKey || 'id']))
        ? undefined
        : specData.value
    return uniqBy(
      [prependData, ...data.value]
        .filter((item) => item)
        .map((item: any) => {
          if (config?.getAllAttributes) {
            return {
              label: item[config.labelKey || 'id'],
              value: item[config.valueKey || 'id'],
              attributes: item
            }
          } else {
            return {
              label: item[config.labelKey || 'id'],
              value: item[config.valueKey || 'id']
            }
          }
        }),
      'value'
    )
  })

  const requestHandler = (_params: any) => {
    const params = {
      ..._params
    }

    if (config.searchKey && keywords.value) {
      params[config.searchKey] = keywords.value
    }

    return config.customRequest
      ? config.customRequest(params)
      : request({
          url: config.requestURL,
          params: {
            ...params,
            size: 3000
          }
        })
  }

  const specData = ref<any>()

  const { fetchData, refreshData, data, isLoading } = usePagination({
    requestHandler: requestHandler
  })

  const onDropdownVisibleChange = (v: boolean) => {
    if (v && data.value.length === 0) {
      fetchData()
    }
  }

  const onPopupScroll = (e: any) => {
    const { target } = e
    if (target.scrollTop + target.offsetHeight >= target.scrollHeight) {
      fetchData()
    }
  }

  onMounted(() => {
    !config.lazy && fetchData()
  })

  const searchAble = computed(() => !!config.searchKey)
  const keywords = ref('')

  const handleSearch = debounce(() => refreshData(), 600)
  const onSearch = (text: string) => {
    keywords.value = text?.trim()
    handleSearch()
  }

  const Selector = (props: SelectProps, { slots }: SetupContext) => {
    valueRef.value = props.value

    return (
      <Select
        style="width:100%"
        allowClear
        {...props}
        filterOption={false}
        showSearch={searchAble.value}
        loading={isLoading.value}
        onDropdownVisibleChange={(v) => {
          onDropdownVisibleChange(v)
          props.onDropdownVisibleChange?.(v)
        }}
        value={props.value}
        onChange={(v) => {
          props.onChange(v)
          setTimeout(() => {
            keywords.value = ''
            // 搜索被清除,重新加载数据
            refreshData()
          }, 300)
        }}
        options={[...options.value]}
        onPopupScroll={(e) => {
          onPopupScroll(e)
          props.onPopupScroll?.(e)
        }}
        searchValue={keywords.value}
        onSearch={onSearch}
      >
        {Object.keys(slots).map((slotName) => slots[slotName]?.())}
      </Select>
    )
  }
  return {
    Selector,
    fetchData,
    options,
    rawData: data
  }
}
