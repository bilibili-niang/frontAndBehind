---
title: 表单组件
---

# 表单组件

表单相关组件与能力由 `@anteng/ui` 提供，结合 Ant Design Vue 的 Form 使用。

## 概述

- Form、FormItem
- Input、Select、DatePicker 等表单域组件
- Modal + 表单的组合使用

## 示例

```vue
<template>
  <Form :model="model">
    <FormItem label="名称">
      <Input v-model:value="model.name" />
    </FormItem>
    <FormItem label="类型">
      <Select v-model:value="model.type" :options="opts" />
    </FormItem>
  </Form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Form, FormItem, Input, Select } from '@anteng/ui'

const model = ref({ name: '', type: '' })
const opts = [
  { label: 'A', value: 'a' },
  { label: 'B', value: 'b' }
]
</script>
```

后续将完善校验、布局与复杂场景的示例。