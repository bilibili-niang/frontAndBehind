# useTableAction

在操作列中渲染统一风格的动作按钮，支持权限控制、禁用、危险态与提示。

## 快速使用

::: code-group
```ts [TSX]
import { useTableAction } from '@anteng/core'

const columns = [
  { title: '名称', dataIndex: 'name' },
  {
    title: '操作',
    render: (_, row) =>
      useTableAction({
        align: 'center',
        list: [
          { title: '编辑', onClick: () => onUpdate(row) },
          { title: '删除', type: 'danger', onClick: () => onRemove(() => api.remove(row.id)) }
        ]
      })
  }
]
```

```vue [Vue2]
<template>
  <!-- 在你的表格组件中按列配置使用 customRender 即可 -->
  <!-- 这里只展示列配置片段，表格结构略 -->
</template>

<script>
import { useTableAction } from '@anteng/core'

// Ant Design Vue 2.x 表格示例列配置
export default {
  data() {
    return {
      columns: [
        { title: '名称', dataIndex: 'name' },
        {
          title: '操作',
          width: 160,
          customRender: ({ record }) =>
            useTableAction({
              align: 'center',
              list: [
                { title: '编辑', onClick: () => this.onUpdate(record) },
                { title: '删除', type: 'danger', onClick: () => this.onRemove(() => api.remove(record.id)) }
              ]
            })
        }
      ]
    }
  },
  methods: {
    onUpdate(row) {
      // 打开编辑弹窗或跳转到编辑页
    },
    onRemove(doRemove) {
      // 调用后端删除
      return doRemove()
    }
  }
}
</script>
```
:::

## TableAction 字段

- `title`：按钮文本。
- `description`：鼠标悬停时的提示内容。
- `type`：`default | danger`。
- `disabled`：禁用态。
- `hidden`：不渲染该动作。
- `icon`：图标节点。
- `onClick()`：点击回调。
- `permission`/`perm`：权限标识，使用系统的权限判断；
  - 存在权限：正常渲染；
  - 不存在权限：依据 `hiddenMode` 处理。
- `hiddenMode`：`hide`（默认，直接隐藏）或 `disable`（显示但禁用）。

## 对齐方式

- `align: 'left' | 'center' | 'right'` 控制按钮组在单元格内的对齐方式。

## 搭配 useCrud

```ts
const actions = (row: any) =>
  useTableAction({
    list: [
      { title: '查看', onClick: () => onRead(row) },
      { title: '编辑', onClick: () => onUpdate(row) },
      { title: '删除', type: 'danger', onClick: () => onRemove(() => api.remove(row.id)) }
    ]
  })
```