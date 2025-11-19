import './index.scss'
import type { RouteMeta } from '@/router/routeMeta'
import { defineComponent, ref } from 'vue'
import { Checkbox, Select } from '@anteng/ui'
import { Card, createEChartsWidget } from '@anteng/core'
import { percentFormat } from '@anteng/utils'
import { Table } from 'ant-design-vue'

export const platformSelection = [
  { label: '全部', value: 'all' },
  { label: '微信小程序', value: 'android' },
  { label: '支付宝小程序', value: 'alipay' },
  { label: '美团', value: 'meituan' },
  { label: '大众点评', value: 'dianping' },
  { label: '其他', value: 'other' }
]

export default defineComponent({
  name: 'data-overview',
  setup() {
    const query = ref<{ time?: string; platform?: string }>({})
    const refreshers: (() => void)[] = []
    const registerRefresher = (fn: () => void) => {
      refreshers.push(fn)
    }
    const setQuery = (next: Partial<{ time: string; platform: string }>) => {
      query.value = { ...query.value, ...next }
    }
    const refreshAll = () => {
      refreshers.forEach((f) => f())
    }

    const QueryBar = defineComponent({
      setup() {
        const dateValue = ref<string>('today')
        const platformValue = ref<string>('all')
        return () => (
          <div class="data-overview-page-query-bar p-3 rounded-lg">
            <div class="data-overview-page-query-item">
              <span class="data-overview-page-query-field-label">平台：</span>
              <Select
                value={platformValue.value}
                options={platformSelection}
                onChange={(v: any) => {
                  platformValue.value = v
                  setQuery({ platform: platformValue.value })
                  refreshAll()
                }}
              />
            </div>
            <div class="data-overview-page-query-item">
              <span class="data-overview-page-query-field-label">时间：</span>
              <Select
                value={dateValue.value}
                options={[
                  { label: '今日', value: 'today' },
                  { label: '本周', value: 'week' },
                  { label: '本月', value: 'month' }
                ]}
                onChange={(v: any) => {
                  dateValue.value = v
                  setQuery({ time: dateValue.value })
                  refreshAll()
                }}
              />
            </div>
          </div>
        )
      }
    })

    const q = () => query.value || {}

    const createOverviewStatWidget = (options: { title: string; customRequest?: (params?: any) => Promise<any> }) => {
      const loading = ref(false)
      const dataRef = ref<any>({})
      const fetchData = () => {
        loading.value = true
        const q = query.value || {}
        const p = options.customRequest
          ? options.customRequest({ ...q })
          : Promise.resolve({ data: {} })
        p
          .then((res: any) => {
            dataRef.value = res?.data || {}
          })
          .finally(() => (loading.value = false))
      }
      registerRefresher(fetchData)
      const Comp = defineComponent({
        setup() {
          fetchData()
          return () => (
            <Card title={options.title} class="data-overview-card">
              <div class="data-overview-card-grid">
                <div class="data-overview-card-item">
                  <div class="data-overview-card-label">浏览量</div>
                  <div class="data-overview-card-value">{dataRef.value?.pv ?? '-'}</div>
                </div>
                <div class="data-overview-card-item">
                  <div class="data-overview-card-label">访次</div>
                  <div class="data-overview-card-value">{dataRef.value?.visits ?? '-'}</div>
                </div>
                <div class="data-overview-card-item">
                  <div class="data-overview-card-label">访客数</div>
                  <div class="data-overview-card-value">{dataRef.value?.uv ?? '-'}</div>
                </div>
                <div class="data-overview-card-item">
                  <div class="data-overview-card-label">IP数</div>
                  <div class="data-overview-card-value">{dataRef.value?.ip ?? '-'}</div>
                </div>
                <div class="data-overview-card-item">
                  <div class="data-overview-card-label">平均访问页数</div>
                  <div class="data-overview-card-value">{dataRef.value?.avgPages ?? '-'}</div>
                </div>
                <div class="data-overview-card-item">
                  <div class="data-overview-card-label">平均访问时长</div>
                  <div class="data-overview-card-value">{dataRef.value?.avgDuration ?? '-'}</div>
                </div>
                <div class="data-overview-card-item">
                  <div class="data-overview-card-label">跳出率</div>
                  <div class="data-overview-card-value">{dataRef.value?.bounceRate ?? '-'}</div>
                </div>
              </div>
            </Card>
          )
        }
      })
      return { Comp, refresh: fetchData, data: dataRef }
    }

    const summary = createOverviewStatWidget({
      title: '流量概览',
      customRequest: (params: any) => {
        const t = params?.time || 'today'
        const p = params?.platform || 'all'
        const timeFactor = t === 'today' ? 0.6 : t === 'week' ? 0.85 : 1
        const platFactor = p === 'android' ? 1.0 : p === 'ios' ? 0.9 : p === 'web' ? 0.7 : 1
        const rand = (min: number, max: number) => Math.round((min + Math.random() * (max - min)) * timeFactor * platFactor)
        const randFloat = (min: number, max: number) => Number(((min + Math.random() * (max - min)) * timeFactor * platFactor).toFixed(1))
        const baseUV = rand(800, 5000)
        const pv = rand(baseUV * 2, baseUV * 3)
        const visits = rand(Math.round(baseUV * 1.2), Math.round(baseUV * 1.8))
        const ip = rand(Math.round(baseUV * 0.8), Math.round(baseUV * 1.1))
        const avgPages = randFloat(1.2, 6.0)
        const avgDuration = rand(30, 300)
        const bounceRate = `${Math.round(10 + Math.random() * 60)}%`
        return Promise.resolve({
          data: { pv, visits, uv: baseUV, ip, avgPages, avgDuration, bounceRate }
        })
      }
    })
    const trendChart = createEChartsWidget({
      title: '趋势图表',
      customRequest: (params: any) => {
        console.log('[Trend] request params', params)
        const t = params?.time || 'today'
        const p = params?.platform || 'all'
        const selected: string[] = Array.isArray(params?.metrics) && params?.metrics.length > 0
          ? params.metrics
          : ['pv', 'uv', 'visits', 'ip', 'bounceRate']
        const timeFactor = t === 'today' ? 0.25 : t === 'week' ? 0.65 : 1
        const platFactor = p === 'android' ? 1.0 : p === 'ios' ? 0.9 : p === 'web' ? 0.7 : 1
        const len = t === 'today' ? 24 : t === 'week' ? 7 : 30
        const labels = Array.from({ length: len }, (_, i) => t === 'today' ? `${String(i).padStart(2, '0')}时` : `D${i + 1}`)
        const rand = (min: number, max: number) => Math.round((min + Math.random() * (max - min)) * timeFactor * platFactor)
        const records = labels.map((l) => {
          const baseUV = rand(100, 800)
          const pv = rand(baseUV * 1.5, baseUV * 2.5)
          const visits = rand(Math.round(baseUV * 0.8), Math.round(baseUV * 1.3))
          const ip = rand(Math.round(baseUV * 0.6), Math.round(baseUV * 0.9))
          const bounceRate = Math.round(10 + Math.random() * 60)
          return { time: l, pv, uv: baseUV, visits, ip, bounceRate }
        })
        console.log('[Trend] generated', { len: records.length, selected })
        return Promise.resolve({ data: { records, selected } })
      },
      build: (data: any) => {
        const records = data?.records ?? []
        const selected: string[] = data?.selected ?? ['pv', 'uv', 'visits', 'ip', 'bounceRate']
        const nameMap: Record<string, string> = {
          pv: '浏览量',
          uv: '访客数',
          visits: '访问次数',
          ip: 'IP数',
          bounceRate: '跳出率'
        }
        const palette = ['#80FFA5', '#00DDFF', '#37A2FF', '#FF0087', '#FFBF00']
        const series = selected
          .map((key, idx) => {
            const isRate = key === 'bounceRate'
            const color = palette[idx % palette.length]
            const gradient = {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color },
                { offset: 1, color: 'rgba(255,255,255,0)' }
              ]
            }
            return {
              name: nameMap[key] || key,
              type: 'line',
              smooth: true,
              stack: isRate ? undefined : 'total',
              lineStyle: { width: isRate ? 2 : 0 },
              showSymbol: true,
              symbol: 'circle',
              symbolSize: isRate ? 5 : 6,
              areaStyle: isRate ? undefined : { opacity: 0.8, color: gradient },
              emphasis: { focus: 'series' },
              yAxisIndex: isRate ? 1 : 0,
              data: records.map((it: any) => Number(it?.[key] ?? 0))
            }
          })
          .filter((s) => s && typeof s === 'object' && s.type)
        return {
          color: palette,
          tooltip: {
            trigger: 'axis',
            confine: true,
            axisPointer: {
              type: 'cross',
              label: { backgroundColor: '#6a7985' },
              crossStyle: { type: 'dashed', width: 1 }
            },
            formatter: (items: any[]) => {
              const time = items?.[0]?.axisValueLabel ?? ''
              const lines = (items || []).map((it) => {
                const isRate = it?.seriesName === '跳出率'
                const v = isRate ? `${it?.data ?? 0}%` : `${it?.data ?? 0}`
                return `${it?.marker || ''}${it?.seriesName || ''}: ${v}`
              })
              return [time, ...lines].join('\n')
            }
          },
          legend: { bottom: 0 },
          grid: { left: 40, right: 40, top: 24, bottom: 36, containLabel: true },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: records.map((it: any) => it.time)
          },
          yAxis: [
            {
              type: 'value',
              name: '访问指标',
              nameLocation: 'middle',
              nameRotate: 90,
              nameGap: 36,
              axisLabel: { hideOverlap: true },
              axisPointer: { label: { formatter: (p: any) => `访问指标: ${parseInt(p.value)}` } }
            },
            {
              type: 'value',
              name: '跳出率(%)',
              nameLocation: 'middle',
              nameRotate: 90,
              nameGap: 36,
              axisLabel: { formatter: (v: number) => `${v}%`, hideOverlap: true },
              axisPointer: { label: { formatter: (p: any) => `跳出率: ${percentFormat(p.value)}` } }
            }
          ],
          series
        }
      }
    })
    registerRefresher(() => trendChart.refresh(query.value || {}))
    const visitorsChart = createEChartsWidget({
      title: '新老访客',
      customRequest: (params: any) => {
        const base = Math.round(100 + Math.random() * 200)
        const old = Math.round(base * (0.4 + Math.random() * 0.2))
        const fresh = base - old
        const records = [
          { type: '新访客', value: fresh },
          { type: '老访客', value: old }
        ]
        return Promise.resolve({ data: { records } })
      },
      build: (data: any) => {
        const records = (data?.records ?? data ?? []).filter(Boolean)
        return {
          tooltip: { trigger: 'item' },
          legend: { bottom: 0 },
          series: [
            {
              type: 'pie',
              radius: ['40%', '70%'],
              avoidLabelOverlap: true,
              label: { show: true, formatter: '{b}: {d}%' },
              data: records.map((it: any) => ({
                name: it?.type ?? it?.name ?? '-',
                value: it?.value ?? it?.count ?? 0
              }))
            }
          ]
        }
      }
    })
    registerRefresher(() => visitorsChart.refresh(query.value || {}))

    const TrendAnalysisForm = defineComponent({
      setup() {
        const baseOptions = [
          { label: '浏览量', value: 'pv' },
          { label: '访客数', value: 'uv' },
          { label: '访问次数', value: 'visits' },
          { label: 'IP数', value: 'ip' }
        ]
        const qualityOptions = [
          { label: '平均访问时长', value: 'avgDuration' },
          { label: '平均访问页数', value: 'avgPages' },
          { label: '跳出率', value: 'bounceRate' }
        ]
        const selectedBase = ref<string[]>(baseOptions.map((o) => o.value))
        const selectedQuality = ref<string[]>(qualityOptions.map((o) => o.value))
        const dataSource = ref<any[]>([])
        const columnsRef = ref<any[]>([])
        const nameMap: Record<string, string> = {
          pv: '浏览量',
          uv: '访客数',
          visits: '访问次数',
          ip: 'IP数',
          avgDuration: '平均访问时长',
          avgPages: '平均访问页数',
          bounceRate: '跳出率'
        }
        const buildData = () => {
          const t = (query.value?.time || 'today') as string
          const p = (query.value?.platform || 'all') as string
          const timeFactor = t === 'today' ? 0.25 : t === 'week' ? 0.65 : 1
          const platFactor = p === 'android' ? 1.0 : p === 'ios' ? 0.9 : p === 'web' ? 0.7 : 1
          const len = t === 'today' ? 24 : t === 'week' ? 7 : 30
          const labels = Array.from({ length: len }, (_, i) => (t === 'today' ? `${String(i).padStart(2, '0')}时` : `D${i + 1}`))
          const rand = (min: number, max: number) => Math.round((min + Math.random() * (max - min)) * timeFactor * platFactor)
          dataSource.value = labels.map((l) => {
            const baseUV = rand(100, 800)
            return {
              time: l,
              pv: rand(baseUV * 1.5, baseUV * 2.5),
              uv: baseUV,
              visits: rand(Math.round(baseUV * 0.8), Math.round(baseUV * 1.3)),
              ip: rand(Math.round(baseUV * 0.6), Math.round(baseUV * 0.9)),
              avgPages: Number((1.2 + Math.random() * 3.0).toFixed(1)),
              avgDuration: rand(30, 300),
              bounceRate: Math.round(10 + Math.random() * 60)
            }
          })
        }
        const buildColumns = () => {
          const selected = [...selectedBase.value, ...selectedQuality.value]
          columnsRef.value = [{ title: '日期', dataIndex: 'time', width: 120 }].concat(
            selected.map((k) => ({
              title: nameMap[k] || k,
              dataIndex: k,
              width: k === 'avgDuration' || k === 'avgPages' ? 140 : 120,
              customRender: ({ text }: any) => (k === 'bounceRate' ? `${text}%` : text)
            }))
          )
        }
        const onChange = () => {
          buildColumns()
        }
        buildData()
        buildColumns()
        registerRefresher(() => {
          buildData()
        })
        return () => (
          <div class="data-overview-trend-form p-2">
            <div class="data-overview-trend-form__filter rounded-lg" style="background: var(--v-color-bg-100);">
              <div class="filter-row">
                <span class="filter-label">流量基础指标：</span>
                <Checkbox.Group value={selectedBase.value} onChange={(v: any) => {
                  selectedBase.value = v as string[]
                  onChange()
                }}>
                  {baseOptions.map((o) => (<Checkbox value={o.value}>{o.label}</Checkbox>))}
                </Checkbox.Group>
              </div>
              <div class="filter-row mt-2">
                <span class="filter-label">流量质量指标：</span>
                <Checkbox.Group value={selectedQuality.value} onChange={(v: any) => {
                  selectedQuality.value = v as string[]
                  onChange()
                }}>
                  {qualityOptions.map((o) => (<Checkbox value={o.value}>{o.label}</Checkbox>))}
                </Checkbox.Group>
              </div>
            </div>
            <div class="mt-2">
              <Table bordered rowKey="time" dataSource={dataSource.value} columns={columnsRef.value}
                     pagination={{ pageSize: 24 }}/>
            </div>
          </div>
        )
      }
    })

    return () => (
      <div class="data-overview-page">
        <QueryBar/>
        <div class="data-overview-page-grid-single ">
          <summary.Comp/>
        </div>
        <div class={`data-overview-page-grid data-overview-page-grid--month`}>
          <Card title={trendChart.title} class="data-overview-card">
            <div class="data-overview-card-filter p-2">
              <span class="data-overview-card-filter-label">指标筛选：</span>
              {(() => {
                const MetricFilter = defineComponent({
                  setup() {
                    const options = [
                      { label: '浏览量', value: 'pv' },
                      { label: '访客数', value: 'uv' },
                      { label: '访问次数', value: 'visits' },
                      { label: 'IP数', value: 'ip' },
                      { label: '跳出率', value: 'bounceRate' }
                    ]
                    const selected = ref<string[]>(options.map((o) => o.value))
                    const onChange = (v: any) => {
                      selected.value = Array.isArray(v) ? v : []
                      console.log('[Trend] metrics change', selected.value)
                      trendChart.setFilter({ metrics: selected.value })
                      trendChart.refresh(query.value || {})
                    }
                    return () => (
                      <Select
                        value={selected.value}
                        options={options}
                        mode="multiple"
                        onChange={onChange}
                      />
                    )
                  }
                })
                return <MetricFilter/>
              })()}
            </div>
            <div class="data-overview-chart">
              <trendChart.Chart/>
            </div>
          </Card>
          <Card title={visitorsChart.title} class="data-overview-card">
            <div class="data-overview-chart">
              <visitorsChart.Chart/>
            </div>
          </Card>
        </div>
        <div class="data-overview-page-grid-single">
          <Card title="趋势分析" class="data-overview-card">
            <TrendAnalysisForm/>
          </Card>
        </div>
      </div>
    )
  }
})

export const routeMeta: RouteMeta = {
  title: '数据概览',
  redirect: '',
  icon: 'analysis',
  order: 1,
  hideInMenu: true
}
