# usePagination 分页

packages/core/src/hooks/usePagination

## 使用

参考示例：apps/store/src/packageA/goods/list/index.tsx

```tsx
import { usePagination } from '@pkg/core'

const pagination = usePagination({
  requestHandler: (params: RequestPagination) => {
    // 在这调用自定义请求函数，params 中必定包含 current、size，以及其他 initialParams 参数
    requestGetData({ ...params, ...其他参数 })
  },
  initialParams: { size: 20 },
  // 若不使用，最好使用 <Loading /> 替代
  showLoading: true
})

const {
  /** 分页数据（包含 meta 数据） */
  paginationData,
  /** 分页数据（仅列表）=== paginationData.records */
  data,
  /** 是否加载中 */
  isLoading,
  /** 是否加载完毕（没有更多数据） */
  isEnd,
  /** 分页加载是否发生错误 */
  hasError,
  /** 是否空数据（isEnd && data 为空） */
  isEmpty,
  /** 搭配 ScrollView 使用，控制下拉刷新是否被触发  */
  refresherTriggered,
  /** 加载(更多)数据 */
  fetchData,
  /** 刷新数据，重置 */
  refreshData,
  /** 刷新单条数据 */
  refreshDataItem,
  /** 结束语组件，默认 <div>没有更多了</div> */
  EndTip,
  /** 加载组件，无需判断 isLoading */
  Loading,
  /** 错误提示组件，无需判断 hasError */
  ErrorStatus,
  Empty
} = pagination

// 初始化时不会自动触发请求，需自行调用
fetchData()


<ScrollView
  style={commonPageHeightStyle.value}
  scrollY
  refresherEnabled
  refresherTriggered={refresherTriggered.value}
  onRefresherrefresh={() => refreshData()}
  onScrolltolower={fetchData}
>
  <div class="p_goods-list__content">
    <GoodsList list={goodsList.value} />
    <ErrorStatus />
    <Empty />
    <Loading />
    <EndTip />
  </div>
</ScrollView>
```

## UsePaginationOptions

| 参数              | 说明                                                                   | 类型                        | 必需 | 默认值 | 可选值              |
| ----------------- | ---------------------------------------------------------------------- | --------------------------- | ---- | ------ | ------------------- |
| requestHandler    | 请求函数，返回 `Promise<PaginationData>`                               | `UsePaginationRequest<T>`   | 是   |        |                     |
| initialParams     | 初始请求参数，不限于 current、size，默认 `{ current: 1, size: 10 }`    | UsePaginationRequestParams  |      | true   |                     |
| useLoading        | 展示 Loading，默认 false                                               | boolean                     |      | center | top／center／bottom |
| dataIndex         | 数据唯一索引（可用于刷新数据），默认 "id"                              | string                      |      | `id`   |                     |
| customEmpty       | 自定义缺省组件                                                         | () => any                   |      |        |                     |
| customEndTip      | 自定义结束语组件                                                       | () => any                   |      |        |                     |
| customLoading     | 自定义加载组件                                                         | () => any                   |      |        |                     |
| customErrorStatus | 自定义错误提示组件，`Actions` 为异常重试按钮组件，请嵌入到自定义节点中 | (Actions: () => any) => any |      |        |                     |

## Returns

| 参数               | 说明                                         | 类型                                                              | 必需 | 默认值 | 可选值 |
| ------------------ | -------------------------------------------- | ----------------------------------------------------------------- | ---- | ------ | ------ |
| paginationData     | 分页数据（包含 meta 信息）                   | `PaginationData<Record = T>`                                      |      |        |        |
| data               | 分页数据（仅列表）=== paginationData.records | `<Record = T>[]`                                                    |      | []     |        |
| isLoading          | 是否加载中                                   | `Ref<boolean>`                                                    |      | false  |
| isEnd              | 是否加载完毕（没有更多数据）                 | `Ref<boolean>`                                                    |      | false  |        |
| hasError           | 分页加载是否发生错误                         | `Ref<boolean>`                                                    |      | false  |        |
| isEmpty            | 是否空数据（isEnd && data 为空）             | `Ref<boolean>`                                                    |      | false  |        |
| refresherTriggered | 搭配 ScrollView 使用，控制下拉刷新是否被触发 | `Ref<boolean>`                                                    |      |        |        |
| fetchData          | 加载(更多)数据                               | () => void                                                        |      |        |
| refreshData        | 刷新（重置）数据                             | （options: [`RefreshDataOptions`](#refreshdataoptions) ） => void |      |        |
| refreshDataItem    | 刷新单条子数据                               | （id: string） => void                                            |      |        |        |
| Loading            | 加载态组件，无需额外判断 isLoading           |                                                                   |      |        |        |
| Empty              | 缺省态组件，无需额外判断 isEmpty             |                                                                   |      |        |        |
| EndTip             | 结束态组件，无需额外判断 isEnd               |                                                                   |      |        |        |
| ErrorStatus        | 错误态组件，无需额外判断 hasError            |                                                                   |      |        |        |

## RefreshDataOptions

| 参数               | 说明                                                           | 类型    | 必需 | 默认值 | 可选值             |
| ------------------ | -------------------------------------------------------------- | ------- | ---- | ------ | ------------------ |
| clearDataImmediate | 立即清空数据，否则将在请求结束时清理数据                       | boolean |      | false  |                    |
| current            | 起始页码，默认 1                                               | number  |      | 1      | \[ 1, +Infinity \] |
| isRefresherPulling | 是否下拉刷新中，默认 true， `如果非下拉刷新触发请设置成 false` | boolean |      | true   |                    |

## Types

```ts
export type UsePaginationRequest<T> = (
  params: RequestPagination<{}>
) => Promise<ResponseData<PaginationData<T>>>

type UsePaginationRequestParams = Partial<RequestPagination<{}>>

/** 通用分页请求 */
export type RequestPagination<T = {}> = {
  /** 当前页码, 1 开始 */
  current: number
  /** 一页数量 */
  size: number
} & /** 其他参数 */ T

/** 通用响应 */
export type ResponseBody<D> = Promise<ResponseData<D>>

/** 通用响应内容 */
export type ResponseData<D> = {
  code: number
  success: boolean
  data: D
  msg: string
}

/** 通用分页内容 */
export type PaginationData<Record> = {
  countId: string
  current: number
  maxLimit: number
  optimizeCountSql: boolean
  orders: string[]
  pages: number
  records: Record[]
  searchCount: boolean
  size: number
  total: number
}

export type ResponsePaginationData<Record> = ResponseBody<
  PaginationData<Record>
>
```
