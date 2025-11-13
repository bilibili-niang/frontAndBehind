---
title: useECharts
outline: deep
---

# useECharts

封装 ECharts 图表的基础 Hook，内置数据请求、刷新与筛选、自动高度以及父容器 ResizeObserver 监听。适用于后台页面快速构建图表。

- 导入：`import { useECharts } from '@anteng/core'`
- 源码：`packages/core/src/components/echarts/index.tsx`

## 最小示例

```ts
import { defineComponent } from 'vue'
import { useECharts } from '@anteng/core'

export default defineComponent(() => {
  const chart = useECharts({
    customRequest: async (params: any) => {
      const records = [
        { time: '10:00', pv: 120 },
        { time: '11:00', pv: 160 }
      ]
      return { data: { records } }
    },
    build: (data: any) => {
      const records = data?.records ?? []
      return {
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', boundaryGap: false, data: records.map((it: any) => it.time) },
        yAxis: { type: 'value' },
        series: [{ type: 'line', data: records.map((it: any) => it.pv) }]
      }
    }
  })
  return () => <chart.Chart/>
})
```

## API

`useECharts(options)` 返回：`{ Chart, refresh, data, instance, setFilter }`

### UseEChartsOptions

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `config` | `any` | - | 直接传入 ECharts 配置；与 `build` 二选一 |
| `height` | `number` | `320` | 初始高度 |
| `requestURL` | `string` | - | 请求地址（使用内置请求工具） |
| `customRequest` | `(params?: any) => Promise<any>` | - | 自定义数据请求，返回 `{ data: ... }` 或数据本身 |
| `build` | `(data: any, instance: echarts.ECharts) => any` | - | 由数据构建 ECharts 配置 |
| `autoHeight` | `boolean` | `true` | 是否随父容器高度变化 |

### 运行时返回值

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `Chart` | `Component` | 用于渲染图表的组件 |
| `refresh` | `(params?: any) => Promise<any>` | 触发数据请求并应用配置 |
| `setFilter` | `(payload: Record<string, any>) => void` | 设置查询条件（与筛选器联动） |
| `data` | `Ref<any>` | 当前数据的响应式引用 |
| `instance` | `Ref<echarts.ECharts | null>` | ECharts 实例引用 |

## 布局与高度

- 默认启用 `autoHeight`，在挂载后测量父容器高度并监听父容器尺寸变化；必要时显式在页面样式设置 `.xxx-chart { height: ... }`
- 参考：`apps/admin/src/views/dataOverview/index.tsx:124`

## 进阶示例：双坐标轴与单位

```ts
const chart = useECharts({
  customRequest: async () => ({ data: { records: [{ time: '10:00', pv: 100, bounceRate: 30 }] } }),
  build: (data) => {
    const records = data?.records ?? []
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
      xAxis: { type: 'category', boundaryGap: false, data: records.map((it: any) => it.time) },
      yAxis: [
        { type: 'value', name: '访问指标', axisPointer: { label: { formatter: (p: any) => `访问指标: ${p.value}` } } },
        { type: 'value', name: '跳出率(%)', axisLabel: { formatter: (v: number) => `${v}%` }, axisPointer: { label: { formatter: (p: any) => `跳出率: ${p.value}%` } } }
      ],
      series: [
        { type: 'line', name: '浏览量', data: records.map((it: any) => it.pv), yAxisIndex: 0 },
        { type: 'line', name: '跳出率', data: records.map((it: any) => it.bounceRate), yAxisIndex: 1 }
      ]
    }
  }
})
```

## 常见问题

- 初次进入页面图表高度异常：为父容器或 `.xxx-chart` 指定有效高度；保持 `autoHeight` 为默认 `true`
- 宽度变化不重绘：父容器使用过渡时，组件内部会监听 `transitionend` 并触发 `resize`