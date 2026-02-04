---
title: 数据展示
---

# 数据展示

数据展示类组件用于呈现信息、结果与列表等内容。

## 概述

- Result（直接 re-export 自 Ant Design Vue）
- Empty、Card、Tag 等
- 结合 ECharts 的图表展示

## 示例

```vue
<template>
  <Result status="success" title="操作成功" sub-title="已成功提交" />
  <Empty description="暂无数据" />
</template>

<script setup lang="ts">
import { Result, Empty } from '@pkg/ui'
</script>
```

后续将补充图表与列表的最佳实践。

## 图表与 ECharts 封装

- 查看 `useECharts`：/components/charts/use-echarts
- 查看 `createEChartsWidget`：/components/charts/create-echarts-widget