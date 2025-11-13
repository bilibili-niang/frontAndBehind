# useECharts / createEChartsWidget

统一封装 ECharts 图表，内置数据请求、刷新与筛选、自动高度以及父容器 ResizeObserver 监听，适用于后台 `apps/admin` 等页面快速构建图表。

- 组件/方法路径：`packages/core/src/components/echarts/index.tsx`
- 对外导出：`import { useECharts, createEChartsWidget } from '@anteng/core'`

## 最小示例

```ts
import { Card } from '@anteng/ui'
import { createEChartsWidget } from '@anteng/core'

const chart = createEChartsWidget({
  title: '趋势图表',
  customRequest: async (params: any) => {
    const data = { records: [{ time: '10:00', pv: 100, uv: 60 }] }
    return { data }
  },
  build: (data: any) => {
    const records = data?.records ?? []
    return {
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: records.map((it: any) => it.time) },
      yAxis: { type: 'value' },
      series: [{ type: 'line', data: records.map((it: any) => it.pv) }]
    }
  }
})

export default () => (
  <Card title={chart.title} class="data-overview-card">
    <div class="data-overview-chart">
      <chart.Chart/>
    </div>
  </Card>
)
```

样式建议（页面样式隔离、类名使用 `-` 连接）：

```scss
.data-overview-page {
  .data-overview-chart {
    width: 100%;
    height: 360px; // 或让父容器决定高度
    background: var(--v-color-bg-50);
  }
}
```

## API 概要

- `useECharts(options)`：返回 `{ Chart, refresh, data, instance, setFilter }`
- `createEChartsWidget({ title, ...options })`：在 `useECharts` 基础上增加 `title` 字段，便于卡片标题展示

`UseEChartsOptions`：

- `config?: any`：直接传入 ECharts 配置对象；与 `build` 二选一
- `height?: number`：初始高度，默认 `320`
- `requestURL?: string`：请求地址（使用内置 `request`）
- `customRequest?: (params?: any) => Promise<any>`：自定义数据请求，返回 `{ data: ... }` 或数据本身
- `build?: (data: any, instance: echarts.ECharts) => any`：根据数据构建 ECharts 配置
- `autoHeight?: boolean`：是否自动随父容器高度变化，默认 `true`

运行时方法：

- `Chart`：渲染图表的组件
- `refresh(params?: any)`：触发数据请求并应用配置
- `setFilter(payload: Record<string, any>)`：设置查询条件，通常与筛选器联动
- `data`：当前数据的响应式引用
- `instance`：ECharts 实例引用

## 布局与高度

- 当 `autoHeight !== false` 时，容器在 `mounted` 阶段会测量父元素高度并设置，随后通过 `ResizeObserver` 监听父元素高度变化并调用 `resize`
- 若父容器没有固定高度，建议在页面样式中通过 `.xxx-chart { height: ... }` 明确高度，或为上层卡片内容区域设置高度
- 典型用法可参考：`apps/admin/src/views/dataOverview/index.tsx:124`

## 调试与排查

- 内置了关键节点的控制台输出：`mounted/refresh/applyOption`，包含容器尺寸、请求参数与数据等，便于定位“初始压缩”等问题
- 若需减少日志，可在发布前移除或通过构建环境变量进行条件控制

## 常见问题

- 初次进入页面图表“压缩”或高度异常：检查父容器是否有有效高度；保持 `autoHeight` 为默认 `true` 或在页面样式中为 `.xxx-chart` 指定高度
- 多指标混合展示且单位不一致：在 `build` 中为不同指标设置 `yAxisIndex`，示例中将 `bounceRate` 绑定到第二坐标轴并设置百分比刻度