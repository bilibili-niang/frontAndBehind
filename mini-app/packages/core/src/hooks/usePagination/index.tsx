import { computed, reactive, ref, toRef } from 'vue'
import { PaginationData, RequestPagination, ResponseData } from '../../api/request'
import { useLoading, useLoadingEnd } from '../useLoading'
import EmptyStatus, { EmptyAction } from '../../components/empty-status'
import Spin from '../../components/spin'
import './style.scss'
import axios from 'axios'
import { Icon } from '@anteng/ui'
import { buildPagination } from './utils'
import ScrollAnchor from '../../components/scroll-anchor'

export type UsePaginationRequest<T> = (params: RequestPagination<{}>) => Promise<ResponseData<PaginationData<T>>>

type UsePaginationRequestParams = Partial<RequestPagination<{}>>

const usePagination = <T,>(options: {
  /** 请求函数，返回 Promise\<PaginationData> */
  requestHandler: UsePaginationRequest<T>
  /** 初始请求参数，不限于current、size，默认 { current: 1, size: 10 } */
  initialParams?: UsePaginationRequestParams
  /** 展示 Loading，默认 false */
  showLoading?: boolean
  /** 数据唯一索引（可用于刷新数据），默认 "id" */
  dataIndex?: string
  /** 自定义缺省组件 */
  customEmpty?: () => any
  /** 自定义结束语组件 */
  customEndTip?: () => any
  /** 自定义加载态 */
  customLoading?: () => any
  /** 自定义错误态 */
  customErrorStatus?: (Actions: () => any) => any
  /**
   * 请求响应回调，
   * 此时isLoading 还是 true，如有需要请结合 nextTick 使用
   */
  onRequestResolve?: (res: ResponseData<PaginationData<T>>) => void
  /** 最多获取多少条数据 */
  maxCounts?: number
}) => {
  const params = reactive<RequestPagination<{}>>({
    ...options.initialParams,
    current: options.initialParams?.current ?? 1,
    size: options.initialParams?.size ?? 10
  })

  const defaultPaginationData = () => {
    return {
      countId: '',
      current: params.current,
      maxLimit: 0,
      optimizeCountSql: true,
      orders: [],
      pages: 0,
      records: [] as T[],
      searchCount: true,
      size: params.size,
      total: 0
    }
  }
  const paginationData = reactive(defaultPaginationData())

  const resetPaginationData = () => {
    Object.assign(paginationData, defaultPaginationData())
    isEnd.value = false
    hasError.value = false
    isLoading.value = false
    params.current = options.initialParams?.current ?? 1
    params.size = options.initialParams?.size ?? 10
  }

  // 将 paginationData.records 转换为响应式引用
  const data = toRef(paginationData, 'records')

  /** 加载中 */
  const isLoading = ref(false)
  /** 分页加载结束，没有更多了 */
  const isEnd = ref(false)
  const hasError = ref(false)

  /** 空列表 */
  const isEmpty = computed(() => {
    return data.value.length === 0 && isEnd.value
  })
  const isRefresherPulling = ref(false)
  const refresherTriggered = computed(() => isRefresherPulling.value && isLoading.value)

  const max = Math.floor(options.maxCounts || 0)

  /** 加载列表数据 */
  const fetchData = async () => {
    // 加载中、已经全部加载完毕，跳过
    if (isLoading.value || isEnd.value) return void 0

    isLoading.value = true
    hasError.value = false
    if (options.showLoading) {
      useLoading()
    }
    try {
      const res = await options.requestHandler(params)
      if (res.code === 200) {
        // 兼容非分页类型数据
        if (Array.isArray(res.data)) {
          res.data = buildPagination(res.data)
        }

        paginationData.current = res.data.current
        paginationData.total = res.data.total

        if (params.current === 1) {
          // 刷新数据时，清空数据
          paginationData.records = []
        }

        const totalLoadedRecords = paginationData.records.length + res.data.records.length

        /** 限制最大数量 */
        const isMax = max >= 1 && data.value.length + res.data.records.length >= max

        // 判断是否已经加载了所有数据
        if (
          isMax ||
          totalLoadedRecords >= res.data.total ||
          res.data.records.length < res.data.size ||
          paginationData.current >= res.data.pages
        ) {
          isEnd.value = true
        } else {
          isEnd.value = false
        }

        ;(paginationData.records as T[]).push(...res.data.records.slice(0, max >= 1 ? max : undefined))
        params.current = paginationData.current + 1
        Promise.resolve()
        options.onRequestResolve?.(res)
      } else {
        hasError.value = true
        console.error('获取分页数据错误', res)
        // TODO 处理分页错误
        Promise.reject(res.msg)
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.warn('请求已取消')
        return void 0
      }
      hasError.value = true
      console.error('获取分页数据错误', error)
      Promise.reject(error)
    } finally {
      isLoading.value = false
      if (options.showLoading) {
        useLoadingEnd()
      }
    }
  }

  /**
   * 刷新数据
   * @param key - 数据唯一索引值
   */
  const refreshDataItem = async (key: string | number, _dataIndex?: string) => {
    try {
      const dataIndex = _dataIndex ?? options.dataIndex ?? 'id'
      const index = data.value.findIndex(item => item[dataIndex] === key)
      // 列表中不存在对应数据，无需刷新
      if (index === -1) return void 0
      const res = await options.requestHandler({ current: 1, size: 1, [dataIndex]: key })
      if (res.code === 200) {
        const newDataItem = res.data.records.find(newItem => newItem[dataIndex] === key) ?? res.data.records[0]
        // 再次比对唯一索引，保证数据安全
        if (newDataItem?.[dataIndex] === data.value[index][dataIndex]) {
          paginationData.records[index] = newDataItem as any
        } else {
          console.error('刷新分页子数据失败：找不到对应数据')
        }
      } else {
        console.error('刷新分页子数据失败', res.msg)
      }
    } catch (error) {
      console.error('刷新分页子数据失败', error)
    }
  }

  const removeDataItem = (key: string | number) => {
    try {
      const dataIndex = options.dataIndex ?? 'id'
      const index = data.value.findIndex(item => item[dataIndex] === key)
      // 列表中不存在对应数据，无需删除
      if (index === -1) return void 0
      data.value.splice(index, 1)
    } catch (error) {
      console.error('删除分页子数据失败', error)
    }
  }

  /** 刷新列表数据，（重置 current = 1） */
  async function refreshData(options?: {
    /** 立即清空数据 */
    clearDataImmediate?: boolean
    /** 起始页码，默认 1 */
    current?: number
    /** 如果非下拉刷新请设置成 false，默认 true */
    isRefresherPulling?: boolean
    silent?: boolean
  }) {
    params.current = Math.max(parseInt(options?.current as any) || 1, 1)
    isEnd.value = false
    hasError.value = false
    isRefresherPulling.value = options?.isRefresherPulling ?? true
    if (options?.clearDataImmediate) {
      resetPaginationData()
    }
    try {
      if (options?.silent) {
        isLoading.value = false
      } else {
        useLoading()
      }
      await fetchData().finally(() => {
        useLoadingEnd()
      })
    } catch (err) {
      resetPaginationData()
    }
    isRefresherPulling.value = false
  }

  /** 结束语，无需判断 isEnd，未加载完毕时显示 "点击加载更多"（可作为触底刷新兜底处理），默认 "没有更多了" */
  const EndTip = () => {
    if (!(isEnd.value && !isEmpty.value)) {
      if (!isLoading.value && !hasError.value && !isEmpty.value) {
        return (
          <div class="use-pag__more-btn" onClick={fetchData}>
            点击加载更多 <Icon name="down" />{' '}
          </div>
        )
      }
      return null
    }
    return options?.customEndTip?.() ?? <div class="use-pag__end">没有更多了</div>
  }

  /** 缺省组件，无需判断 isEmpty */
  const Empty = () => {
    if (!isEmpty.value) return null
    return options.customEmpty?.() ?? <EmptyStatus title="空空如也" description="找不到相关内容" />
  }

  /** 加载组件，无需判断 isLoading */
  const Loading = (props: { small?: boolean }) => {
    if (!isLoading.value) return null
    return options.customLoading?.() ?? (data.value.length > 0 || props?.small) ? (
      <div class="use-pag__loading">
        <Spin />
        加载中
      </div>
    ) : (
      <div class="use-pag__loading--empty">
        <Spin />
      </div>
    )
  }

  const ErrorStatus = () => {
    if (!hasError.value) return null
    const Actions = () => (
      // @ts-ignore
      <EmptyAction primary onClick={fetchData}>
        重试
      </EmptyAction>
    )
    return (
      options.customErrorStatus?.(Actions) ?? (
        <EmptyStatus
          description="数据加载失败"
          vSlots={{
            actions: Actions
          }}
        ></EmptyStatus>
      )
    )
  }

  const LoadMore = () => (
    <ScrollAnchor
      onReach={() => {
        if (hasError.value) {
          return void 0
        }
        fetchData()
      }}
    />
  )

  const CommonPaginationStatus = () => {
    return (
      <>
        <LoadMore />
        <Loading />
        <Empty />
        <ErrorStatus />
        <EndTip />
      </>
    )
  }

  return {
    paginationData,
    isLoading,
    isEnd,
    isEmpty,
    refresherTriggered,
    removeDataItem,
    fetchData,
    refreshData,
    data,
    refreshDataItem,
    EndTip,
    Empty,
    Loading,
    ErrorStatus,
    resetPaginationData,
    hasError,
    CommonPaginationStatus,
    LoadMore
  }
}

export default usePagination
