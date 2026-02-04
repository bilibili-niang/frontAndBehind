# useSearchTable

表格检索组件与钩子，整合筛选器、分页、排序、导出、多选与操作列，适用于常见的列表页。

## 快速使用

::: code-group
```ts [TSX]
import { useSearchTable } from '@pkg/core'

const { Table, refresh, reload, filterRef, setFilterState } = useSearchTable({
  requestURL: '/api/example/page',
  defaultDescs: 'create_time',
  filter: {
    list: [
      { key: 'name', label: '名称', type: 'input' },
      { key: 'status', label: '状态', type: 'select', config: { options: [
        { label: '启用', value: 1 },
        { label: '停用', value: 0 }
      ] } },
      { key: 'create_time', label: '创建时间', type: 'range-picker' }
    ]
  },
  table: {
    columns: [
      { title: '名称', dataIndex: 'name' },
      { title: '状态', dataIndex: 'status' },
      { title: '创建时间', dataIndex: 'create_time' }
    ]
  }
})

// 在模板中渲染
// <Table />
```

```vue [Vue2]
<template>
  <SearchTable
    :tableKey="tableKey"
    title="示例列表"
    :filter="filter"
    :table="table"
    :initialSize="pageSize"
    :customRequest="customRequest"
  >
    <template #toolbar>
      <Button type="primary" @click="refresh">刷新数据</Button>
      <Button @click="silentRefresh">静默刷新</Button>
    </template>
  </SearchTable>
</template>

<script>
import { Button } from '@pkg/ui'
import { SearchTable } from '@pkg/core'

const TABLE_KEY = 'vue2-search-table-demo'

export default {
  name: 'Vue2SearchTableDemo',
  components: { Button, SearchTable },
  data() {
    return {
      pageSize: 10,
      tableKey: TABLE_KEY,
      filter: {
        list: [
          { key: 'name', label: '名称', type: 'input', fixed: true },
          { key: 'status', label: '状态', type: 'select', fixed: true, config: { options: [
            { label: '启用', value: 1 },
            { label: '停用', value: 0 }
          ] } },
          { key: 'create_time', label: '创建时间', type: 'range-picker' }
        ]
      },
      table: {
        columns: [
          { title: '名称', dataIndex: 'name' },
          { title: '状态', dataIndex: 'status' },
          { title: '创建时间', dataIndex: 'create_time' }
        ]
      }
    }
  },
  methods: {
    async customRequest(params) {
      // 这里按你的业务请求接口，返回分页响应
      // 示例仅返回空数据结构
      return Promise.resolve({ code: 200, success: true, data: { records: [], total: 0 } })
    },
    refresh() {
      // 通过更换 tableKey 或者触发内部刷新逻辑来刷新
      this.tableKey = TABLE_KEY + '-' + Date.now()
    },
    silentRefresh() {
      // 自行触发接口后更新数据源（示例略）
    }
  }
}
</script>
```
:::

## 配置项（SearchTableConfig）

- `key`：表格唯一 key，配合刷新/重载使用。
- `title`/`titleBehind`：标题与标题右侧区域插槽。
- `toolbar`/`toolbarHidden`：工具栏元素与隐藏开关。
- `filter`：筛选器定义，见下方 Filter DSL。
- `filterFront`/`filterBehind`：筛选器前/后插槽。
- `table`：表格参数，继承 `@pkg/ui` 的 `TableProps`，支持 `columns` 中的 `hidden` 字段。
- `customTable(dataSource, { loading })`：自定义表格渲染，接管默认表格。
- `requestURL`：分页接口地址（与 `customRequest` 至少一个存在）。
- `exportURL`：导出地址。
- `defaultDescs`：默认降序字段，默认 `create_time`。
- `customRequest(params)`：自定义请求函数，返回接口响应。
- `onInterceptRequest(params)`：请求参数拦截。
- `onInterceptResponse(res)`：响应拦截，可二次加工 `res.data`。
- `onReset()`：重置筛选时触发。
- `footer()`：表格底部内容。
- `initialSize`：首次分页尺寸，默认 `20`。
- `multiple()`/`multipleValue`：开启多选与响应式选中集合。

## Filter DSL（FilterDefine）

- `list`：筛选项数组，常用 `type`：`input`、`input-number`、`select`、`date-picker`、`range-picker`、`time-picker`、`time-range-picker`、`cascader`。
- `config`：传递给具体控件的参数，例如 `SelectProps`、`DatePickerProps` 等。
- `flex`：24 栅格列宽。
- `fixed`：是否始终展示在收起模式下。
- `hidden`：隐藏该筛选项。
- `withWrap`：是否带外层 `label` 包裹。
- `maxWidth`/`minWidth`：控件宽度限制。
- `format(rawParams)`：对最终的查询参数做二次处理。
- `default`：初始筛选参数。

特殊：`range-picker` 自动输出两段时间并拼接查询字典；也支持传入快速区间字符串（如：最近7天）。

## 常用方法

- `refresh(params?, silent?)`：按当前状态刷新，或替换查询参数。
- `reload()`：重置分页到第 1 页后刷新。
- `filterRef`：筛选器组件的引用，可 `setFilterState(newState, autoRefresh)`。
- `setFilterState(newState, autoRefresh)`：替换筛选状态。

## 多标签列表

```ts
import { useTabSearchTable } from '@pkg/core'

const { Tabs } = useTabSearchTable([
  { title: '全部', config: { requestURL: '/api/example/page' } },
  { title: '已启用', config: { requestURL: '/api/example/page', filter: { default: { status: 1 } } } }
])

// <Tabs />
```

## 列渲染辅助

- `useTableLongText(title, text, len?)`：长文本弹窗查看。
- `useTableImages(images, showThumbnail?)`：图片预览。
- `useTableAddress({ address, name?, longitude, latitude })`：地址查看与跳转。

## 插槽

- `title`、`titleBehind`、`toolbar`、`filterFront`、`filterBehind`：与同名配置项对应。

## 自定义请求示例

```ts
const { Table } = useSearchTable({
  customRequest: async (params) => {
    // 组装你自己的请求
    return await myApi.page(params)
  },
  onInterceptRequest: (params) => ({ ...params, extra: 1 }),
  onInterceptResponse: (res) => ({ ...res, data: res.data || [] })
})
```