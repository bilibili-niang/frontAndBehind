# useCrud

模态表单增删改查的轻量封装，统一标题、宽度、回调、格式化与成功提示。

## 快速使用

::: code-group
```ts [TSX]
import { useCrud } from '@pkg/core'

const { onCreate, onUpdate, onRemove, onRead } = useCrud<{ id: number; name: string }>({
  title: '分类',
  schema: (type) => ({
    type: 'object',
    properties: {
      name: { title: '名称', type: 'string', required: true }
    }
  }),
  onCreate: (data) => api.create(data),
  onUpdate: (data) => api.update(data),
  onRemove: () => api.remove(selectedId)
})

// 新建
onCreate()
// 编辑
onUpdate(row)
// 删除
onRemove()
// 查看（只读）
onRead(row)
```

```vue [Vue2]
<script>
import { useCrud } from '@pkg/core'

// 在 Vue2 中同样直接调用 useCrud 获取动作函数
const { onCreate, onUpdate, onRemove, onRead } = useCrud({
  title: '分类',
  schema: (type) => ({
    type: 'object',
    properties: { name: { title: '名称', type: 'string', required: true } }
  }),
  onCreate: (data) => api.create(data),
  onUpdate: (data) => api.update(data),
  onRemove: () => api.remove(selectedId)
})

export default {
  name: 'Vue2CrudQuickDemo',
  methods: {
    // 新建
    onCreate() { onCreate(() => Promise.resolve({ code: 200 })) },
    // 编辑
    onUpdate(row) { onUpdate(row) },
    // 删除
    onRemove() { onRemove() },
    // 查看（只读）
    onRead(row) { onRead(row) }
  }
}
</script>
```
:::

## UseCrudOptions

- `title`：业务名称，用于生成默认标题，如“新建分类”“编辑分类”。
- `width`：弹窗宽度，默认 `620`。
- `fullScreen`：是否全屏弹窗。
- `createTitle`/`updateTitle`/`removeTitle`：各动作标题覆盖。
- `schema`：`Schema | (type) => Schema` 表单 Schema；支持按类型返回不同 Schema。
- `value`/`onChange(value)`：外部状态与变更回调。
- `defaultValue()`：创建时默认值。
- `format(value)`：提交前格式化。
- `retrieve(value)`：编辑时从行数据提取用于表单的初始值。
- `onCreate(value)`/`onUpdate(value)`/`onRemove()`：提交处理，返回后端响应；成功时需返回 `code === 200`。
- `onCreateSuccess(data)`/`onUpdateSuccess(data)`/`onRemoveSuccess(data)`：成功后的回调。
- `onToggleStatus(status)`/`onToggleSuccess(status)`：状态切换（0/1）。

## 标题与模式

- 创建：`create` 模式，默认标题为 `新建${title}`。
- 编辑：`update` 模式，默认标题为 `编辑${title}`；可传 `prefixText` 控制前缀文本或 `null` 禁用前缀。
- 查看：只读模式，标题为 `查看${title}`。

## Schema 示例

```ts
const schema = {
  type: 'object',
  properties: {
    name: { title: '名称', type: 'string', required: true },
    status: { title: '状态', type: 'boolean' }
  },
  // 也可以使用根级 required 写法：required: ['name']
}
```

## 结合 SearchTable

::: code-group
```tsx [TSX]
import { Button } from '@pkg/ui'
import { SearchTable, useCrud, useTableAction } from '@pkg/core'

export default function Demo() {
  const { onCreate, onUpdate, onRemove, refresh } = useCrud({
    title: '分类',
    schema,
    onCreate: (v) => api.create(v),
    onUpdate: (v) => api.update(v),
    onRemove: () => Promise.resolve({ code: 200, msg: '删除成功' })
  })

  const columns = [
    { title: '名称', dataIndex: 'name' },
    {
      title: '操作',
      render: (_, row) =>
        useTableAction({
          list: [
            { title: '编辑', onClick: () => onUpdate(row) },
            { title: '删除', type: 'danger', onClick: () => onRemove(() => api.remove(row.id)) }
          ]
        })
    }
  ]

  const customRequest = async (params) => {
    // 这里按你的业务请求接口
    return api.list(params)
  }

  return (
    <SearchTable
      tableKey="tsx-demo"
      title="示例列表"
      filter={{ list: [{ key: 'keywords', label: '关键词', type: 'input', fixed: true }] }}
      table={{ columns }}
      initialSize={10}
      customRequest={customRequest}
    >
      <div slot="toolbar" className="flex gap-2">
        <Button type="primary" onClick={() => onCreate(() => Promise.resolve({ code: 200 }))}>新建</Button>
        <Button type="primary" onClick={refresh}>刷新数据</Button>
      </div>
    </SearchTable>
  )
}
```

```vue [Vue2]
<template>
  <SearchTable
    :tableKey="tableKey"
    :title="'示例列表'"
    :filter="filter"
    :table="table"
    :initialSize="pageSize"
    :customRequest="customRequest"
  >
    <template #toolbar>
      <div class="flex gap-2">
        <Button type="primary" @click="onCreateRealize">新建</Button>
        <Button type="primary" @click="refresh">刷新数据</Button>
      </div>
    </template>
  </SearchTable>
  
  <!-- 以上示例基于 apps/admin/src/views/template/useSearchTableForVue2/index.vue 的精简版 -->
</template>

<script>
import { Button } from '@pkg/ui'
import { SearchTable, useCrud, useTableAction } from '@pkg/core'

const TABLE_KEY = 'vue2-demo-search-table'
const { onCreate, onUpdate, onRemove, refresh } = useCrud({
  title: '示例项',
  schema: (type) => ({
    type: 'object',
    properties: {
      name: { title: '名称', type: 'string', required: type === 'create' },
      status: { title: '状态', type: 'boolean' }
    }
  }),
  retrieve: (row) => ({ name: row.name, status: row.status })
})

export default {
  name: 'Vue2DemoPage',
  components: { Button, SearchTable },
  data() {
    return {
      pageSize: 10,
      tableKey: TABLE_KEY,
      filter: { list: [{ key: 'keywords', label: '关键词', type: 'input', fixed: true }] },
      table: {
        columns: [
          { dataIndex: 'id', title: 'ID', width: 120 },
          { dataIndex: 'name', title: '名称', width: 260 },
          {
            title: '操作',
            width: 160,
            customRender: ({ record }) =>
              useTableAction({
                list: [
                  { title: '编辑', onClick: () => onUpdate(record) },
                  { title: '删除', type: 'danger', onClick: () => onRemove(() => Promise.resolve({ code: 200 })) }
                ]
              })
          }
        ]
      }
    }
  },
  methods: {
    async customRequest(params) {
      // 这里按你的业务请求接口；示例返回假数据
      return Promise.resolve({ code: 200, data: { records: [], total: 0 }, success: true })
    },
    onCreateRealize() {
      onCreate(() => Promise.resolve({ code: 200 }), refresh)
    }
  }
}
</script>
```
:::