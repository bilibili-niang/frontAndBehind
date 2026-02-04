---
title: createEChartsWidget
outline: deep
---

# createEChartsWidget

在 `useECharts` 基础上增加 `title` 字段，便于与卡片组合使用，快速形成“卡片 + 图表”的页面模块。

- 导入：`import { createEChartsWidget } from '@pkg/core'`
- 源码：`packages/core/src/components/echarts/index.tsx`

## 快速示例

```ts
import { Card } from '@pkg/ui'
import { createEChartsWidget } from '@pkg/core'

const trendChart = createEChartsWidget({
  title: '趋势图表',
  customRequest: async (params: any) => {
    const records = [
      { time: '10:00', pv: 120, uv: 80, visits: 90, ip: 70, bounceRate: 30 },
      { time: '11:00', pv: 160, uv: 110, visits: 120, ip: 95, bounceRate: 28 }
    ]
    return { data: { records } }
  },
  build: (data: any) => {
    const records = data?.records ?? []
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
      legend: { bottom: 0 },
      grid: { left: 24, right: 24, top: 24, bottom: 36 },
      xAxis: { type: 'category', boundaryGap: false, data: records.map((it: any) => it.time) },
      yAxis: [
        { type: 'value', name: '访问指标', axisPointer: { label: { formatter: (p: any) => `访问指标: ${p.value}` } } },
        { type: 'value', name: '跳出率(%)', axisLabel: { formatter: (v: number) => `${v}%` }, axisPointer: { label: { formatter: (p: any) => `跳出率: ${p.value}%` } } }
      ],
      series: [
        { type: 'line', name: '浏览量', smooth: true, areaStyle: {}, data: records.map((it: any) => it.pv) },
        { type: 'line', name: '访客数', smooth: true, areaStyle: {}, data: records.map((it: any) => it.uv) },
        { type: 'line', name: '访问次数', smooth: true, areaStyle: {}, data: records.map((it: any) => it.visits) },
        { type: 'line', name: 'IP数', smooth: true, areaStyle: {}, data: records.map((it: any) => it.ip) },
        { type: 'line', name: '跳出率', smooth: true, areaStyle: {}, yAxisIndex: 1, data: records.map((it: any) => it.bounceRate) }
      ]
    }
  }
})

export default () => (
  <Card title={trendChart.title} class="data-overview-card">
    <div class="data-overview-chart">
      <trendChart.Chart/>
    </div>
  </Card>
)
```

## 与筛选器联动

```ts
// 设置筛选条件并刷新
trendChart.setFilter({ metrics: ['pv', 'uv'] })
trendChart.refresh({ time: 'week', platform: 'android' })
```

## 布局与高度建议

- 推荐在页面样式中为图表容器提供确定高度：`.data-overview-chart { height: 360px }`
- 默认开启 `autoHeight` 与父容器尺寸监听；宽度变化带过渡时会在 `transitionend` 后触发重绘

## API

`createEChartsWidget({ title, ...options })` 返回：`{ title, Chart, refresh, data, instance, setFilter }`

### Options

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | `string` | - | 卡片标题 |
| `config` | `any` | - | 直接传入 ECharts 配置；与 `build` 二选一 |
| `height` | `number` | `320` | 初始高度 |
| `requestURL` | `string` | - | 请求地址（使用内置请求工具） |
| `customRequest` | `(params?: any) => Promise<any>` | - | 自定义数据请求，返回 `{ data: ... }` 或数据本身 |
| `build` | `(data: any, instance: echarts.ECharts) => any` | - | 由数据构建 ECharts 配置 |
| `autoHeight` | `boolean` | `true` | 是否随父容器高度变化 |

### 运行时返回值

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `title` | `string` | 标题字段，便于与卡片组合 |
| `Chart` | `Component` | 用于渲染图表的组件 |
| `refresh` | `(params?: any) => Promise<any>` | 触发数据请求并应用配置 |
| `setFilter` | `(payload: Record<string, any>) => void` | 设置查询条件（与筛选器联动） |
| `data` | `Ref<any>` | 当前数据的响应式引用 |
| `instance` | `Ref<echarts.ECharts | null>` | ECharts 实例引用 |

## 参考实现

- 趋势图页面：`apps/admin/src/views/dataOverview/index.tsx:124`

## 常见问题

- 高度“压缩”或初始异常：确保父容器有有效高度或在图表容器显式设置高度
- 不同单位的指标混合展示：通过 `yAxisIndex` 绑定到不同坐标轴，右轴可设置百分比刻度