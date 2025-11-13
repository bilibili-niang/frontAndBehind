import './index.scss'
import type { RouteMeta } from '@/router/routeMeta'
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { Select } from '@anteng/ui'
import { Card, createEChartsWidget } from '@anteng/core'

export default defineComponent({
  name: 'trend-analysis',
  setup() {
    const query = ref<{
      time?: 'today' | 'week' | 'month';
      platform?: 'all' | 'android' | 'ios' | 'web'
    }>({ time: 'today', platform: 'all' })
    const refreshers: (() => void)[] = []
    const registerRefresher = (fn: () => void) => refreshers.push(fn)
    const refreshAll = () => refreshers.forEach((f) => f())

    const QueryBar = defineComponent({
      setup() {
        const platformValue = ref<string>('all')
        const timeValue = ref<string>('today')
        return () => (
          <div class="trend-analysis-query-bar">
            <span class="trend-analysis-query-field-label">平台：</span>
            <Select
              value={platformValue.value}
              options={[{ label: '全部', value: 'all' }, { label: '安卓', value: 'android' }, {
                label: '苹果',
                value: 'ios'
              }, { label: '网页', value: 'web' }]}
              onChange={(v: any) => {
                platformValue.value = v
                query.value.platform = v
                refreshAll()
              }}
            />
            <span class="trend-analysis-query-field-label">时间：</span>
            <Select
              value={timeValue.value}
              options={[{ label: '今日', value: 'today' }, { label: '本周', value: 'week' }, {
                label: '本月',
                value: 'month'
              }]}
              onChange={(v: any) => {
                timeValue.value = v
                query.value.time = v
                refreshAll()
              }}
            />
          </div>
        )
      }
    })

    const productViewsChart = createEChartsWidget({
      title: '产品浏览量TOP10',
      customRequest: async (params: any) => {
        const t = params?.time || 'today'
        const p = params?.platform || 'all'
        const timeFactor = t === 'today' ? 0.9 : t === 'week' ? 1.0 : 1.1
        const platFactor = p === 'android' ? 1.0 : p === 'ios' ? 0.95 : p === 'web' ? 0.85 : 1
        const items = Array.from({ length: 10 }).map((_, i) => ({
          name: `商品${i + 1}`,
          value: Math.round((300 + Math.random() * 600) * timeFactor * platFactor)
        }))
        return { data: { records: items } }
      },
      build: (data: any) => {
        const records = data?.records ?? []
        return {
          tooltip: { trigger: 'axis' },
          grid: { left: 48, right: 24, top: 24, bottom: 24, containLabel: true },
          xAxis: { type: 'category', data: records.map((it: any) => it.name) },
          yAxis: {
            type: 'value',
            name: '浏览量(次)',
            nameLocation: 'end',
            nameRotate: 0,
            nameGap: 8,
            axisLabel: { margin: 8 }
          },
          series: [{ type: 'bar', data: records.map((it: any) => it.value), itemStyle: { borderRadius: [4, 4, 0, 0] } }]
        }
      }
    })

    const avgOrderValueChart = createEChartsWidget({
      title: '客单价趋势',
      customRequest: async (params: any) => {
        const t = params?.time || 'today'
        const len = t === 'today' ? 24 : t === 'week' ? 7 : 30
        const labels = Array.from({ length: len }, (_, i) => (t === 'today' ? `${String(i).padStart(2, '0')}时` : `D${i + 1}`))
        const values = labels.map(() => Number((60 + Math.random() * 120).toFixed(2)))
        return { data: { labels, values } }
      },
      build: (data: any) => ({
        tooltip: { trigger: 'axis', confine: true },
        grid: { left: 48, right: 24, top: 24, bottom: 24, containLabel: true },
        xAxis: { type: 'category', boundaryGap: false, data: data?.labels ?? [] },
        yAxis: {
          type: 'value',
          name: '客单价(元)',
          nameLocation: 'end',
          nameRotate: 0,
          nameGap: 8,
          axisLabel: { margin: 8 }
        },
        series: [{ type: 'line', smooth: true, symbol: 'circle', symbolSize: 6, data: data?.values ?? [] }]
      })
    })

    const orderCountChart = createEChartsWidget({
      title: '点单量趋势',
      customRequest: async (params: any) => {
        const t = params?.time || 'today'
        const len = t === 'today' ? 24 : t === 'week' ? 7 : 30
        const labels = Array.from({ length: len }, (_, i) => (t === 'today' ? `${String(i).padStart(2, '0')}时` : `D${i + 1}`))
        const values = labels.map(() => Math.round(50 + Math.random() * 180))
        return { data: { labels, values } }
      },
      build: (data: any) => ({
        tooltip: { trigger: 'axis', confine: true },
        grid: { left: 48, right: 24, top: 24, bottom: 24, containLabel: true },
        xAxis: { type: 'category', data: data?.labels ?? [] },
        yAxis: {
          type: 'value',
          name: '点单量(单)',
          nameLocation: 'end',
          nameRotate: 0,
          nameGap: 8,
          axisLabel: { margin: 8 }
        },
        series: [{ type: 'bar', data: data?.values ?? [], itemStyle: { borderRadius: [4, 4, 0, 0] } }]
      })
    })

    const RelationChart = defineComponent({
      setup() {
        const el = ref<HTMLDivElement | null>(null)
        let instance: echarts.ECharts | null = null
        const customRequest = async () => {
          const segments = ['新客', '老客']
          const items = Array.from({ length: 60 }).map((_, i) => ({
            product: `商品${i + 1}`,
            views: Math.round(120 + Math.random() * 880),
            orders: Math.round(15 + Math.random() * 195),
            aov: Number((50 + Math.random() * 180).toFixed(2)),
            segment: segments[Math.random() > 0.5 ? 1 : 0]
          }))
          return { data: { records: items } }
        }
        const build = (data: any) => {
          const records = data?.records ?? []
          const newGuest = records.filter((r: any) => r.segment === '新客')
          const oldGuest = records.filter((r: any) => r.segment === '老客')
          const toPoints = (list: any[]) => list.map((r) => [r.views, r.orders, r.aov, r.product])
          const maxX = Math.max(...records.map((r: any) => r.views), 1000)
          const maxY = Math.max(...records.map((r: any) => r.orders), 200)
          return {
            tooltip: {
              trigger: 'item',
              formatter: (p: any) => {
                const v = Array.isArray(p.value) ? p.value : []
                const name = v[3] || p.name || ''
                return `${name}\\n浏览量:${v[0]}\\n点单量:${v[1]}\\n客单价:${v[2]}元\\n客群:${p.seriesName}`
              }
            },
            legend: { top: 8, right: 8, data: ['新客', '老客'] },
            grid: { left: 48, right: 24, top: 24, bottom: 36, containLabel: true },
            xAxis: { type: 'value', name: '浏览量(次)', nameLocation: 'end', nameRotate: 0, nameGap: 8, axisLabel: { margin: 8 }, min: 0, max: maxX, splitLine: { show: true } },
            yAxis: { type: 'value', name: '点单量(单)', nameLocation: 'end', nameRotate: 0, nameGap: 8, axisLabel: { margin: 8 }, min: 0, max: maxY, splitLine: { show: true } },
            series: [
              {
                name: '新客',
                type: 'scatter',
                itemStyle: { color: '#69b1ff', opacity: 0.85 },
                symbolSize: (val: any) => {
                  const aov = Array.isArray(val) ? Number(val[2]) : val && Array.isArray(val.value) ? Number(val.value[2]) : NaN
                  const size = isFinite(aov) ? aov / 5 : 12
                  return Math.max(10, Math.min(26, size))
                },
                data: toPoints(newGuest)
              },
              {
                name: '老客',
                type: 'scatter',
                itemStyle: { color: '#ffbf00', opacity: 0.85 },
                symbolSize: (val: any) => {
                  const aov = Array.isArray(val) ? Number(val[2]) : val && Array.isArray(val.value) ? Number(val.value[2]) : NaN
                  const size = isFinite(aov) ? aov / 5 : 12
                  return Math.max(10, Math.min(26, size))
                },
                data: toPoints(oldGuest)
              }
            ]
          }
        }
        const refresh = async () => {
          const res = await customRequest()
          const option = build(res?.data ?? res)
          instance?.setOption(option, true)
          try { requestAnimationFrame(() => instance?.resize()) } catch {}
        }
        onMounted(() => {
          const container = el.value as HTMLDivElement
          container.style.width = '100%'
          container.style.height = '100%'
          instance = echarts.init(container)
          refresh()
          const onResize = () => instance?.resize()
          window.addEventListener('resize', onResize)
          ;(instance as any).__onResize__ = onResize
        })
        onBeforeUnmount(() => {
          const fn = (instance as any)?.__onResize__
          if (fn) window.removeEventListener('resize', fn)
          instance?.dispose()
          instance = null
        })
        registerRefresher(() => refresh())
        return () => <div ref={el}></div>
      }
    })

    registerRefresher(() => {
      productViewsChart.refresh(query.value)
      avgOrderValueChart.refresh(query.value)
      orderCountChart.refresh(query.value)
    })

    return () => (
      <div class="trend-analysis-page">
        <QueryBar/>
        <div class="trend-analysis-grid">
          <Card title={productViewsChart.title} class="trend-analysis-card">
            <div class="trend-analysis-chart">
              <productViewsChart.Chart/>
            </div>
          </Card>
          <Card title={avgOrderValueChart.title} class="trend-analysis-card">
            <div class="trend-analysis-chart">
              <avgOrderValueChart.Chart/>
            </div>
          </Card>
          <Card title={orderCountChart.title} class="trend-analysis-card">
            <div class="trend-analysis-chart">
              <orderCountChart.Chart/>
            </div>
          </Card>
          <Card title={'产品-客户关联分析'} class="trend-analysis-card" style="grid-column: span 3;">
            <div class="trend-analysis-chart">
              <RelationChart/>
            </div>
          </Card>
        </div>
      </div>
    )
  }
})

export const routeMeta: RouteMeta = {
  title: '趋势分析',
  icon: 'trend-two',
  order: 1
}
