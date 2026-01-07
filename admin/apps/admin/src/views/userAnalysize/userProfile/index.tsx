import './index.scss'
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue'
import { Card, createEChartsWidget } from '@pkg/core'
import { Select } from '@pkg/ui'
import type { RouteMeta } from '@/router/routeMeta'
import { platformSelection } from '@/views/dataOverview'
import * as echarts from 'echarts'

export default defineComponent({
  name: 'UserProfile',
  setup() {
    // 筛选条件
    const query = ref<{
      time?: 'today' | 'week' | 'month';
      platform?: 'all' | 'android' | 'ios' | 'web'
    }>({ time: 'today', platform: 'all' })

    // 顶部指标
    const stats = ref([
      { label: '总用户数', value: '-' },
      { label: '新增用户', value: '-' },
      { label: '活跃率', value: '-' },
      { label: '留存率', value: '-' }
    ])

    // 性别占比（环形图）
    const genderChart = createEChartsWidget({
      title: '性别占比',
      customRequest: async (params: any) => {
        const t = params?.time || 'today'
        const p = params?.platform || 'all'
        const timeFactor = t === 'today' ? 1 : t === 'week' ? 0.95 : 0.9
        const platFactor = p === 'android' ? 1.0 : p === 'ios' ? 0.9 : p === 'web' ? 0.8 : 1
        const male = Math.round((40 + Math.random() * 30) * timeFactor * platFactor)
        const female = Math.round((30 + Math.random() * 30) * timeFactor * platFactor)
        const other = Math.max(100 - male - female, 0)
        return {
          data: {
            records: [
              { name: '男', value: male },
              { name: '女', value: female },
              { name: '其他', value: other }
            ]
          }
        }
      },
      build: (data) => ({
        tooltip: { trigger: 'item', confine: true },
        legend: { bottom: 0 },
        series: [{
          type: 'pie',
          radius: ['45%', '70%'],
          avoidLabelOverlap: true,
          label: { show: true, position: 'inside', formatter: '{b}: {d}%' },
          labelLine: { show: false },
          data: (data?.records ?? data ?? []) as any
        }]
      })
    })

    // 年龄区间（柱状图）
    const ageChart = createEChartsWidget({
      title: '年龄区间',
      customRequest: async (params: any) => {
        const t = params?.time || 'today'
        const p = params?.platform || 'all'
        const timeFactor = t === 'today' ? 0.8 : t === 'week' ? 1.0 : 1.2
        const platFactor = p === 'android' ? 1.0 : p === 'ios' ? 0.95 : p === 'web' ? 0.85 : 1
        const names = ['18-25', '26-35', '36-45', '46+']
        const base = [120, 220, 180, 140]
        const records = names.map((n, i) => ({
          name: n,
          value: Math.round((base[i] + Math.random() * 180) * timeFactor * platFactor)
        }))
        return { data: { records } }
      },
      build: (data) => ({
        tooltip: { trigger: 'axis', confine: true },
        grid: { left: 48, right: 24, top: 24, bottom: 24, containLabel: true },
        xAxis: { type: 'category', data: (data?.records ?? data ?? []).map((it: any) => it.name) },
        yAxis: { type: 'value', name: '', axisLabel: { margin: 8 } },
        series: [{
          type: 'bar',
          barWidth: 24,
          itemStyle: { borderRadius: [4, 4, 0, 0] },
          data: (data?.records ?? data ?? []).map((it: any) => it.value)
        }]
      })
    })

    // 用户浏览时长趋势（折线+切换）
    const durationChart = createEChartsWidget({
      title: '用户浏览时长趋势',
      customRequest: async (params: any) => {
        const t = params?.time || 'today'
        const p = params?.platform || 'all'
        const labels = t === 'today' ? ['0', '2', '4', '6', '8', '10', '12', '14'] : t === 'week' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : Array.from({ length: 15 }, (_, i) => `${i + 1}`)
        const timeFactor = t === 'today' ? 0.8 : t === 'week' ? 1.0 : 1.1
        const platFactor = p === 'android' ? 1.0 : p === 'ios' ? 0.95 : p === 'web' ? 0.85 : 1
        const randSeries = () => labels.map(() => Math.round((50 + Math.random() * 80) * timeFactor * platFactor))
        return { data: { labels, member: randSeries(), normal: randSeries() } }
      },
      build: (data) => ({
        tooltip: { trigger: 'axis', confine: true },
        legend: {
          top: 8,
          right: 8,
          data: ['老访客', '新访客'],
          selectedMode: true,
          selected: { '老访客': true, '新访客': true }
        },
        grid: { left: 48, right: 24, top: 40, bottom: 24, containLabel: true },
        xAxis: { type: 'category', boundaryGap: false, data: data?.labels ?? [] },
        yAxis: {
          type: 'value',
          name: '时长(分钟)',
          nameLocation: 'end',
          nameRotate: 0,
          nameGap: 8,
          nameTextStyle: { padding: [0, 0, 8, 0] },
          axisLabel: { margin: 8 }
        },
        series: [
          {
            name: '老访客',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            data: data?.member ?? []
          },
          {
            name: '新访客',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            data: data?.normal ?? []
          }
        ]
      })
    })

    // 消费分次热力（面积图）
    const heatChart = createEChartsWidget({
      title: '消费分次热力',
      customRequest: async (params: any) => {
        const t = params?.time || 'today'
        const p = params?.platform || 'all'
        const timeFactor = t === 'today' ? 0.9 : t === 'week' ? 1.0 : 1.1
        const platFactor = p === 'android' ? 1.0 : p === 'ios' ? 0.95 : p === 'web' ? 0.85 : 1
        const records = [
          { name: '工作日', value: Math.round((260 + Math.random() * 140) * timeFactor * platFactor) },
          { name: '周末', value: Math.round((220 + Math.random() * 160) * timeFactor * platFactor) }
        ]
        return { data: { records } }
      },
      build: (data) => ({
        tooltip: { trigger: 'axis', confine: true },
        grid: { left: 48, right: 24, top: 32, bottom: 24, containLabel: true },
        xAxis: { type: 'category', boundaryGap: true, data: (data?.records ?? data ?? []).map((it: any) => it.name) },
        yAxis: {
          type: 'value',
          name: '',
          axisLabel: { hideOverlap: true, margin: 8 },
          min: 0
        },
        series: [{
          type: 'line',
          smooth: false,
          lineStyle: { width: 2 },
          symbol: 'circle',
          symbolSize: 6,
          areaStyle: { opacity: 0.35 },
          data: (data?.records ?? data ?? []).map((it: any) => it.value)
        }]
      })
    })

    // 页面浏览量TOP5（环形图）
    const top5Chart = createEChartsWidget({
      title: '页面浏览量TOP5',
      customRequest: async (params: any) => {
        const t = params?.time || 'today'
        const p = params?.platform || 'all'
        const timeFactor = t === 'today' ? 0.9 : t === 'week' ? 1.0 : 1.1
        const platFactor = p === 'android' ? 1.0 : p === 'ios' ? 0.95 : p === 'web' ? 0.85 : 1
        const pages = ['首页', '商品', '订单', '个人', '帮助']
        const records = pages.map((pg, i) => ({
          name: pg,
          value: Math.round((10 + i * 6 + Math.random() * 30) * timeFactor * platFactor)
        }))
        return { data: { records } }
      },
      build: (data) => ({
        tooltip: { trigger: 'item', confine: true },
        legend: { bottom: 0 },
        series: [{
          type: 'pie',
          radius: ['45%', '70%'],
          avoidLabelOverlap: true,
          label: { show: true, position: 'inside', formatter: '{b}: {d}%' },
          labelLine: { show: false },
          data: (data?.records ?? data ?? []) as any
        }]
      })
    })

    const newOldUsersChart = createEChartsWidget({
      title: '新老用户',
      customRequest: async (params: any) => {
        const t = params?.time || 'today'
        const p = params?.platform || 'all'
        const timeFactor = t === 'today' ? 1.0 : t === 'week' ? 0.95 : 0.9
        const platFactor = p === 'android' ? 1.0 : p === 'ios' ? 0.95 : p === 'web' ? 0.85 : 1
        const base = Math.round(800 + Math.random() * 600)
        const old = Math.round(base * (0.55 + Math.random() * 0.15) * timeFactor * platFactor)
        const fresh = Math.max(base - old, 0)
        const records = [
          { name: '新用户', value: fresh },
          { name: '老用户', value: old }
        ]
        return { data: { records } }
      },
      build: (data) => ({
        tooltip: { trigger: 'item', confine: true },
        legend: { bottom: 0 },
        series: [{
          type: 'pie',
          radius: ['45%', '70%'],
          avoidLabelOverlap: true,
          label: { show: true, position: 'inside', formatter: '{b}: {d}%' },
          labelLine: { show: false },
          data: (data?.records ?? data ?? []) as any
        }]
      })
    })

    const coreFunnelChart = createEChartsWidget({
      title: '核心转化漏斗',
      customRequest: async (params: any) => {
        const t = params?.time || 'today'
        const p = params?.platform || 'all'
        const timeFactor = t === 'today' ? 1.0 : t === 'week' ? 0.95 : 0.9
        const platFactor = p === 'android' ? 1.0 : p === 'ios' ? 0.95 : p === 'web' ? 0.85 : 1
        const steps = [
          '浏览商品详情页',
          '选择SKU/规格',
          '加入购物车',
          '发起结算',
          '提交订单',
          '调用支付',
          '支付成功'
        ]
        const base = 5000
        const rates = [1.0, 0.7, 0.55, 0.42, 0.38, 0.35, 0.32]
        const records = steps.map((name, i) => ({ name, value: Math.round(base * rates[i] * timeFactor * platFactor) }))
        return { data: { records } }
      },
      build: (data) => ({
        tooltip: { trigger: 'item', confine: true },
        series: [{
          type: 'funnel',
          left: '10%',
          top: 24,
          bottom: 24,
          width: '80%',
          min: 0,
          max: 5000,
          sort: 'descending',
          gap: 2,
          label: { show: true, position: 'inside' },
          data: (data?.records ?? data ?? []) as any
        }]
      })
    })

    const auxiliaryBehaviorChart = createEChartsWidget({
      title: '辅助转化行为',
      customRequest: async (params: any) => {
        const t = params?.time || 'today'
        const p = params?.platform || 'all'
        const timeFactor = t === 'today' ? 1.0 : t === 'week' ? 0.95 : 0.9
        const platFactor = p === 'android' ? 1.0 : p === 'ios' ? 0.95 : p === 'web' ? 0.85 : 1
        const sources = ['使用优惠券', '添加到收藏', '搜索商品(有结果)', '搜索商品(无结果)']
        const base = [520, 460, 620, 140]
        const records = sources.map((s, i) => ({
          name: s,
          value: Math.round((base[i] + Math.random() * 120) * timeFactor * platFactor)
        }))
        return { data: { records } }
      },
      build: (data) => ({
        tooltip: { trigger: 'axis', confine: true },
        grid: { left: 48, right: 24, top: 24, bottom: 24, containLabel: true },
        xAxis: { type: 'category', data: (data?.records ?? data ?? []).map((it: any) => it.name) },
        yAxis: {
          type: 'value',
          name: '次数(次)',
          nameLocation: 'end',
          nameRotate: 0,
          nameGap: 8,
          axisLabel: { margin: 8 }
        },
        series: [{
          type: 'bar',
          itemStyle: { borderRadius: [4, 4, 0, 0] },
          data: (data?.records ?? data ?? []).map((it: any) => it.value)
        }]
      })
    })

    const searchTermsChart = createEChartsWidget({
      title: '搜索词TOP10（结果/无结果）',
      customRequest: async (params: any) => {
        const t = params?.time || 'today'
        const timeFactor = t === 'today' ? 1.0 : t === 'week' ? 0.95 : 0.9
        const terms = Array.from({ length: 10 }).map((_, i) => `词${i + 1}`)
        const data = terms.map((term) => {
          const total = Math.round((80 + Math.random() * 160) * timeFactor)
          const noRes = Math.round(total * (0.1 + Math.random() * 0.2))
          const hasRes = total - noRes
          return { term, hasRes, noRes }
        })
        return { data }
      },
      build: (data) => ({
        tooltip: { trigger: 'axis', confine: true },
        legend: { top: 8, right: 8, data: ['有结果', '无结果'] },
        grid: { left: 48, right: 24, top: 40, bottom: 24, containLabel: true },
        xAxis: { type: 'category', data: (data ?? []).map((it: any) => it.term) },
        yAxis: {
          type: 'value',
          name: '搜索次数(次)',
          nameLocation: 'end',
          nameRotate: 0,
          nameGap: 8,
          axisLabel: { margin: 8 }
        },
        series: [
          {
            name: '有结果',
            type: 'bar',
            itemStyle: { borderRadius: [4, 4, 0, 0] },
            data: (data ?? []).map((it: any) => it.hasRes)
          },
          {
            name: '无结果',
            type: 'bar',
            itemStyle: { borderRadius: [4, 4, 0, 0] },
            data: (data ?? []).map((it: any) => it.noRes)
          }
        ]
      })
    })

    let behaviorRelationSetFilter: (payload: any) => void = () => {
    }
    let behaviorRelationRefresh: () => void = () => {
    }
    const BehaviorRelationChart = defineComponent({
      setup() {
        const el = ref<HTMLDivElement | null>(null)
        let instance: echarts.ECharts | null = null
        let filter = { ...query.value }
        const setFilter = (payload: any) => {
          filter = { ...payload }
        }
        behaviorRelationSetFilter = setFilter
        const customRequest = async () => {
          const t = filter?.time || 'today'
          const p = filter?.platform || 'all'
          const timeFactor = t === 'today' ? 1.0 : t === 'week' ? 0.95 : 0.9
          const platFactor = p === 'android' ? 1.0 : p === 'ios' ? 0.95 : p === 'web' ? 0.85 : 1
          const steps = [
            '浏览商品详情页',
            '选择SKU/规格',
            '加入购物车',
            '发起结算',
            '提交订单',
            '调用支付',
            '支付成功'
          ]
          const baseCount = 1200
          const countRates = [1.0, 0.78, 0.62, 0.48, 0.42, 0.38, 0.34]
          const basePay = 380
          const payRates = [0.22, 0.28, 0.35, 0.55, 0.65, 0.85, 1.0]
          const items = steps.map((name, i) => ({
            name,
            count: Math.round((baseCount * countRates[i]) * timeFactor * platFactor),
            payments: Math.round((basePay * payRates[i]) * timeFactor * platFactor),
            aov: Number((70 + Math.random() * 90).toFixed(2))
          }))
          return { data: items }
        }
        const build = (items: any[]) => {
          const maxX = Math.max(...(items || []).map((r: any) => r.count), 1000)
          const maxY = Math.max(...(items || []).map((r: any) => r.payments), 400)
          return {
            tooltip: { trigger: 'item', confine: true },
            legend: { top: 8, left: 'center' },
            grid: { left: 56, right: 56, top: 24, bottom: 56, containLabel: true },
            xAxis: {
              type: 'value',
              name: '行为触发(次)',
              nameLocation: 'middle',
              nameRotate: 0,
              nameGap: 28,
              axisLabel: { margin: 10 },
              min: 0,
              max: maxX,
              splitLine: { show: true }
            },
            yAxis: {
              type: 'value',
              name: '支付成功(单)',
              nameLocation: 'end',
              nameRotate: 0,
              nameGap: 10,
              axisLabel: { margin: 8 },
              min: 0,
              max: maxY,
              splitLine: { show: true }
            },
            series: (items || []).map((r: any) => ({
              name: r.name,
              type: 'scatter',
              symbolSize: (val: any) => {
                const aov = Array.isArray(val) ? Number(val[2]) : val && Array.isArray((val as any).value) ? Number((val as any).value[2]) : NaN
                const size = isFinite(aov) ? aov / 5 : 12
                return Math.max(10, Math.min(26, size))
              },
              data: [[r.count, r.payments, r.aov, r.name]],
              emphasis: {
                focus: 'series',
                label: { show: true, formatter: (p: any) => (Array.isArray(p.value) ? p.value[3] : r.name) }
              }
            }))
          }
        }
        const refresh = async () => {
          const res: any = await customRequest()
          const option = build(res?.data ?? res)
          instance?.setOption(option, true)
          try {
            requestAnimationFrame(() => instance?.resize())
          } catch (e) {
            console.log(e)
          }
        }
        behaviorRelationRefresh = refresh
        onMounted(() => {
          const container = el.value as HTMLDivElement
          container.style.width = '100%'
          const parent = container.parentElement as HTMLElement
          const ph = parent ? Math.max(parent.clientHeight, 300) : 300
          container.style.height = `${ph}px`
          instance = echarts.init(container)
          refresh()
          const onResize = () => {
            const p = container.parentElement as HTMLElement
            const h = p ? Math.max(p.clientHeight, 300) : 300
            container.style.height = `${h}px`
            instance?.resize()
          }
          window.addEventListener('resize', onResize)
          ;(instance as any).__onResize__ = onResize
        })
        onBeforeUnmount(() => {
          const fn = (instance as any)?.__onResize__
          if (fn) window.removeEventListener('resize', fn)
          instance?.dispose()
          instance = null
        })
        return () => <div ref={el}></div>
      }
    })

    const acquisitionChart = createEChartsWidget({
      title: '获客来源',
      customRequest: async (params: any) => {
        const t = params?.time || 'today'
        const p = params?.platform || 'all'
        const timeFactor = t === 'today' ? 1.0 : t === 'week' ? 0.95 : 0.9
        const platFactor = p === 'android' ? 1.0 : p === 'ios' ? 0.95 : p === 'web' ? 0.85 : 1
        const sources = ['公众号文章', '扫码', '搜索', '好友分享', '广告']
        const base = [260, 220, 280, 200, 180]
        const records = sources.map((s, i) => ({
          name: s,
          value: Math.round((base[i] + Math.random() * 120) * timeFactor * platFactor)
        }))
        return { data: { records } }
      },
      build: (data) => ({
        tooltip: { trigger: 'axis', confine: true },
        grid: { left: 48, right: 24, top: 24, bottom: 24, containLabel: true },
        xAxis: { type: 'category', data: (data?.records ?? data ?? []).map((it: any) => it.name) },
        yAxis: {
          type: 'value',
          name: '获客数(人)',
          nameLocation: 'end',
          nameRotate: 0,
          nameGap: 8,
          axisLabel: { margin: 8 }
        },
        series: [{
          type: 'bar',
          itemStyle: { borderRadius: [4, 4, 0, 0] },
          data: (data?.records ?? data ?? []).map((it: any) => it.value)
        }]
      })
    })

    // 单品浏览占比（漏斗图）
    const funnelChart = createEChartsWidget({
      title: '单品浏览占比',
      customRequest: async (params: any) => {
        const t = params?.time || 'today'
        const p = params?.platform || 'all'
        const timeFactor = t === 'today' ? 1.0 : t === 'week' ? 0.95 : 0.9
        const platFactor = p === 'android' ? 1.0 : p === 'ios' ? 0.95 : p === 'web' ? 0.85 : 1
        const v1 = Math.round((60 + Math.random() * 25) * timeFactor * platFactor)
        const v2 = Math.round((40 + Math.random() * 25) * timeFactor * platFactor)
        const v3 = Math.max(100 - v1 - v2, 10)
        return {
          data: {
            records: [
              { name: '会员', value: v1 },
              { name: '付费', value: v2 },
              { name: '普通', value: v3 }
            ]
          }
        }
      },
      build: (data) => ({
        tooltip: { trigger: 'item', confine: true },
        series: [{
          type: 'funnel',
          left: '10%',
          top: 24,
          bottom: 24,
          width: '80%',
          min: 0,
          max: 100,
          minSize: '0%',
          maxSize: '100%',
          sort: 'descending',
          gap: 2,
          label: { show: true, position: 'inside' },
          data: (data?.records ?? data ?? []) as any
        }]
      })
    })

    // 用户分层（饼图）
    const layerChart = createEChartsWidget({
      title: '用户分层',
      customRequest: async (params: any) => {
        const t = params?.time || 'today'
        const p = params?.platform || 'all'
        const timeFactor = t === 'today' ? 1.0 : t === 'week' ? 0.95 : 0.9
        const platFactor = p === 'android' ? 1.0 : p === 'ios' ? 0.95 : p === 'web' ? 0.85 : 1
        const a = Math.round((40 + Math.random() * 30) * timeFactor * platFactor)
        const b = Math.max(100 - a, 0)
        return {
          data: {
            records: [
              { name: '普通用户停留热点', value: a },
              { name: '会员集中停留', value: b }
            ]
          }
        }
      },
      build: (data) => ({
        tooltip: { trigger: 'item', confine: true },
        legend: { bottom: 0 },
        series: [{
          type: 'pie',
          radius: ['45%', '70%'],
          avoidLabelOverlap: true,
          label: { show: true, position: 'inside', formatter: '{b}: {d}%' },
          labelLine: { show: false },
          data: (data?.records ?? data ?? []) as any
        }]
      })
    })

    // 刷新所有图表
    const refreshAll = () => {
      genderChart.refresh()
      ageChart.refresh()
      durationChart.refresh()
      heatChart.refresh()
      top5Chart.refresh()
      acquisitionChart.refresh()
      newOldUsersChart.refresh()
      coreFunnelChart.refresh()
      auxiliaryBehaviorChart.refresh()
      searchTermsChart.refresh()
      behaviorRelationRefresh()
      funnelChart.refresh()
      layerChart.refresh()
    }

    const applyFilters = () => {
      const payload = { ...query.value }
      genderChart.setFilter(payload)
      ageChart.setFilter(payload)
      durationChart.setFilter(payload)
      heatChart.setFilter(payload)
      top5Chart.setFilter(payload)
      acquisitionChart.setFilter(payload)
      newOldUsersChart.setFilter(payload)
      coreFunnelChart.setFilter(payload)
      auxiliaryBehaviorChart.setFilter(payload)
      searchTermsChart.setFilter(payload)
      behaviorRelationSetFilter(payload)
      funnelChart.setFilter(payload)
      layerChart.setFilter(payload)
      genStats(payload)
      refreshAll()
    }

    const genStats = (params: any) => {
      const t = params?.time || 'today'
      const p = params?.platform || 'all'
      const timeFactor = t === 'today' ? 0.6 : t === 'week' ? 0.85 : 1
      const platFactor = p === 'android' ? 1.0 : p === 'ios' ? 0.92 : p === 'web' ? 0.8 : 1
      const base = Math.round(8000 + Math.random() * 6000)
      const totalUsers = Math.round(base * timeFactor * platFactor)
      const newUsers = Math.round(totalUsers * (0.08 + Math.random() * 0.06))
      const activeRate = `${(50 + Math.random() * 35).toFixed(1)}%`
      const retentionRate = `${(30 + Math.random() * 25).toFixed(1)}%`
      stats.value = [
        { label: '总用户数', value: totalUsers.toLocaleString() },
        { label: '新增用户', value: newUsers.toLocaleString() },
        { label: '活跃率', value: activeRate },
        { label: '留存率', value: retentionRate }
      ]
    }

    onMounted(() => {
      genStats(query.value)
    })

    return () => (
      <div class="user-profile-page">
        {/* 页面标题 */}
        <div class="page-header">
          <h1>用户画像分布</h1>
          <span class="sub-title">用户群体分布</span>
        </div>

        {/* 顶部指标 */}
        <div class="stats-row">
          {stats.value.map((s) => (
            <Card class="stat-card">
              <div class="stat-label">{s.label}</div>
              <div class="stat-value">{s.value}</div>
            </Card>
          ))}
        </div>

        {/* 过滤器 */}
        <div class="user-profile-query-bar">
          <span class="user-profile-query-label">平台：</span>
          <Select
            value={query.value.platform}
            options={platformSelection}
            onChange={(v: any) => {
              query.value.platform = v
              applyFilters()
            }}
          />
          <span class="user-profile-query-label">时间：</span>
          <Select
            value={query.value.time}
            options={[{ label: '今日', value: 'today' }, { label: '本周', value: 'week' }, {
              label: '本月',
              value: 'month'
            }]}
            onChange={(v: any) => {
              query.value.time = v
              applyFilters()
            }}
          />
        </div>

        {/* 图表网格 */}
        <div class="chart-grid">
          {/* 性别占比 */}
          <Card title={genderChart.title} class="chart-card">
            <div class="chart-body">
              <genderChart.Chart/>
            </div>
          </Card>

          {/* 年龄区间 */}
          <Card title={ageChart.title} class="chart-card">
            <div class="chart-body">
              <ageChart.Chart/>
            </div>
          </Card>

          {/* 用户浏览时长趋势（带切换） */}
          <Card title={durationChart.title} class="chart-card">
            <div class="chart-body">
              <durationChart.Chart/>
            </div>
          </Card>

          {/* 消费分次热力 */}
          <Card title={heatChart.title} class="chart-card">
            <div class="chart-body">
              <heatChart.Chart/>
            </div>
          </Card>

          {/* 页面浏览量TOP5 */}
          <Card title={top5Chart.title} class="chart-card">
            <div class="chart-body">
              <top5Chart.Chart/>
            </div>
          </Card>

          {/* 新老用户 */}
          <Card title={newOldUsersChart.title} class="chart-card">
            <div class="chart-body">
              <newOldUsersChart.Chart/>
            </div>
          </Card>

          {/* 核心转化漏斗 */}
          <Card title={coreFunnelChart.title} class="chart-card">
            <div class="chart-body">
              <coreFunnelChart.Chart/>
            </div>
          </Card>

          {/* 辅助转化行为 */}
          <Card title={auxiliaryBehaviorChart.title} class="chart-card">
            <div class="chart-body">
              <auxiliaryBehaviorChart.Chart/>
            </div>
          </Card>

          {/* 搜索词TOP10（结果/无结果） */}
          <Card title={searchTermsChart.title} class="chart-card">
            <div class="chart-body">
              <searchTermsChart.Chart/>
            </div>
          </Card>

          {/* 行为-转化关系 */}
          <Card title={'行为-转化关系'} class="chart-card chart-card--span-2">
            <div class="chart-body">
              <BehaviorRelationChart/>
            </div>
          </Card>

          <Card title={acquisitionChart.title} class="chart-card">
            <div class="chart-body">
              <acquisitionChart.Chart/>
            </div>
          </Card>

          {/* 单品浏览占比（漏斗） */}
          <Card title={funnelChart.title} class="chart-card">
            <div class="chart-body">
              <funnelChart.Chart/>
            </div>
          </Card>

          {/* 用户分层 */}
          <Card title={layerChart.title} class="chart-card">
            <div class="chart-body">
              <layerChart.Chart/>
            </div>
          </Card>
        </div>
      </div>
    )
  }
})

export const routeMeta: RouteMeta = {
  title: '用户画像',
  // icon: 'user-positioning',
  order: 1,
  hideInMenu: true
}
