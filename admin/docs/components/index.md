---
outline: deep
---

# 组件概览

组件能力由 `@anteng/ui` 提供，基于 Ant Design Vue 进行轻封装并统一样式前缀，与项目的 TSX/SFC 开发方式保持一致。

## 主要组件与能力

- 基础组件：`Button`、`Input`、`Switch`、`Select`、`Tabs` 等
- 反馈与弹窗：`message`、`Modal`、`Popover`、`Tooltip`
- 布局与交互：`ScrollContainer`、`Empty`、`Icon`
- 兼容导出：直接 re-export Ant Design Vue 常用组件（如 `Result` 等）

## 使用指南

### 导入与使用

```ts
import { Button, Input, Modal, message, Icon } from '@anteng/ui'

message.success('操作成功')
```

在模板或 TSX 中使用：

::: code-group
```vue [Vue2]
<template>
  <Button type="primary" @click="onClick">确定</Button>
  <Input v-model:value="text" placeholder="请输入" />
  <!-- Vue2 示例：选项式 API -->
</template>

<script>
import { Button, Input, message } from '@anteng/ui'

export default {
  name: 'UiBasicExample',
  components: { Button, Input },
  data() {
    return { text: '' }
  },
  methods: {
    onClick() {
      message.success('已点击')
    }
  }
}
</script>
```

```tsx [TSX]
import { defineComponent, ref } from 'vue'
import { Button, Input, message } from '@anteng/ui'

export default defineComponent(() => {
  const text = ref('')
  const onClick = () => message.success('已点击')
  return () => (
    <div>
      <Input v-model:value={text.value} placeholder="请输入" />
      <Button type="primary" onClick={onClick}>确定</Button>
    </div>
  )
})
```
:::

### 全局样式前缀与主题

`@anteng/ui` 在包内部通过 Ant Design Vue 的 `ConfigProvider` 设置了统一前缀 `PREFIX_CLS`，并内置基础样式与重置（`ant-design-vue/dist/reset.css`）。应用无需额外配置即可获得统一外观。

### 常见问题

- TSX 下某些事件类型不完整？
  - 可在应用中进行适当断言（如 `onChange={fn as any}`），同时欢迎在 `@anteng/ui` 提交类型完善 PR。

---

更多示例请结合业务页面与组件源代码查看。

## 图表组件文档

- `useECharts`：/components/charts/use-echarts
- `createEChartsWidget`：/components/charts/create-echarts-widget