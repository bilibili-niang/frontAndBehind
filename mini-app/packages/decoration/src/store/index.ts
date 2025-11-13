import { defineStore } from 'pinia'
import { computed, markRaw, ref } from 'vue'
import { uuid } from '@anteng/core'
import type { Schema } from '@anteng/jsf'
import { registeredComponents } from '../render-components'
import { cloneDeep, defaultsDeep } from 'lodash'
import customPageSchema from './customPageSchema'

export type ComponentPackage = {
  manifest: Record<string, any>
  render: any
  __LOADED?: boolean
}

export type PageComponent = {
  id: string
  key: string
  name: string
  schema: Schema
  value: any
  attrs?: any
  enabled?: boolean
  component: any
}

export const useDecorationStore = defineStore('decoration', () => {
  const isLoading = ref(false)
  const packages = ref<Record<string, ComponentPackage>>({})
  const pageComponents = ref<PageComponent[]>([])
  const activeId = ref<string | null>(null)
  // 设备预览缩放（1 表示 100%）
  const zoom = ref(1.0)
  // 当前正在编辑的页面（用于发布后再更新）
  const currentPageId = ref<string | null>(null)
  // 当前页面的元信息（用于编辑态：回显 title/description 等）
  const currentPageMeta = ref<{ title?: string; description?: string; name?: string } | null>(null)
  // 当前装修页面类型：自定义(custom) 或 系统(system)
  const pageKind = ref<'custom' | 'system'>('custom')
  const setPageKind = (kind: 'custom' | 'system') => {
    pageKind.value = kind
  }

  // 页面级配置默认值：以 customPageSchema.default 为主，补充 gap 与 contentPadding
  const __initialPageValue: any = cloneDeep({
    ...customPageSchema.default,
    basic: {
      ...customPageSchema.default.basic,
      gap: customPageSchema?.default?.basic?.gap ?? 8,
      contentPadding: customPageSchema?.default?.basic?.contentPadding ?? [0, 0, 0, 0]
    }
  })
  const page = ref(cloneDeep(__initialPageValue))

  const pageSchema = customPageSchema

  // 组件目录
  const componentsCatalog = computed(() => {
    return Array.from(registeredComponents.values())
      .filter((comp: any) => comp?.implicit !== true)
      .map(comp => ({
      key: comp.key,
      name: comp.name,
      type: comp.type,
      thumbnail: comp.thumbnail
    }))
  })

  // 当前激活的组件
  const activeComponent = computed(() => {
    return pageComponents.value.find(c => c.id === activeId.value) || null
  })

  // 记录头部初始值，用于 reset 恢复初始状态
  const __initialHeaderAttrs = cloneDeep({})
  // 头部默认值（用于导航栏预览与持久化）
  const __initialHeaderValue = cloneDeep({
    height: 40,
    divider: false,
    title: '',
    titleAlign: 'center',
    background: '#ffffff',
    left: { back: false, menu: false },
    right: { add: false, more: false }
  })
  // 头部状态（value/attrs 与组件预览联动）
  const header = ref<{ value: any; attrs: any }>({
    value: cloneDeep(__initialHeaderValue),
    attrs: cloneDeep(__initialHeaderAttrs)
  })

  // 加载所有组件
  const loadAll = async () => {
    isLoading.value = true
    try {
      // 这里可以预加载一些必要的组件
      console.log('Available components:', Array.from(registeredComponents.keys()))
      // 防御：确保已有组件的 component 非响应式，避免 Vue 警告
      pageComponents.value.forEach((c) => {
        c.component = markRaw(c.component)
      })
    } finally {
      isLoading.value = false
    }
  }

  // 加载组件包（含属性清单）
  const loadComponentPackage = async (key: string): Promise<ComponentPackage> => {
    const existed = packages.value[key]
    if (existed) return existed

    const comp = registeredComponents.get(key)
    if (!comp) throw new Error(`找不到组件包：${key}`)

    // 记录占位，避免并发重复加载
    packages.value[key] = { manifest: { key }, render: null, __LOADED: false }
    const res = await comp.render()
    const renderComp = (res.render ?? res.default)
    const pkg: ComponentPackage = { manifest: res.manifest, render: markRaw(renderComp), __LOADED: true }
    packages.value[key] = pkg
    return pkg
  }

  const addComponent = async (key: string) => {
    const meta = componentsCatalog.value.find((m) => m.key === key)
    if (!meta) return
    const pkg = await loadComponentPackage(key)
    const id = uuid()
    const schema: Schema = (pkg.manifest?.schema as any) ?? ({ type: 'object', properties: {} } as any)
    const initial = (pkg.manifest as any).default ?? pkg.manifest.defaultAttrs ?? schema?.default ?? {}
    const value = cloneDeep(initial)
    const pageItem: PageComponent = {
      id,
      key,
      name: meta.name,
      schema,
      value,
      attrs: (pkg.manifest as any).defaultAttrs ?? {},
      enabled: true,
      component: pkg.render
    }
    pageComponents.value.push(pageItem)
    activeId.value = id
  }

  const setActive = (id: string | null) => {
    activeId.value = id
  }

  const setActiveHeader = () => {
    activeId.value = ''
  }

  const setZoom = (v: number | string) => {
    const n = typeof v === 'string' ? parseFloat(v) : v
    zoom.value = isFinite(n) ? Math.max(0.1, Math.min(n, 3)) : 1
  }

  // 清理当前编辑态（不动 currentPageId，便于外部在编辑/新建时自行设定）
  const reset = () => {
    pageComponents.value = []
    activeId.value = null
    // 恢复页面级配置
    page.value = cloneDeep(__initialPageValue)
    // 预览缩放回到默认
    zoom.value = 1.2
    // 恢复头部默认配置
    header.value = {
      value: cloneDeep(__initialHeaderValue),
      attrs: cloneDeep(__initialHeaderAttrs)
    }
  }

  // 序列化当前装修为可持久化的对象
  const buildDecoratePayload = () => {
    const headerValue = cloneDeep(header.value.value || {})
    const headerAttrs = cloneDeep(header.value.attrs || {})
    const components = pageComponents.value.map((c) => ({
      // Canvas 需要 id 用于图层树和选中态映射
      id: c.id,
      key: c.key,
      name: c.name,
      config: cloneDeep(c.value),
      attrs: cloneDeep(c.attrs || {}),
      enabled: c.enabled !== false,
      // 简化：无嵌套时 parent 为空
      parent: (c as any).parent ?? null,
      hidden: false,
      locked: false
    }))
    // 输出时保证 contentPadding 为数组（如有对象则转换）
    const pageOut = cloneDeep(page.value)
    const cp = pageOut?.basic?.contentPadding as any
    if (cp && typeof cp === 'object' && !Array.isArray(cp)) {
      pageOut.basic.contentPadding = [cp.top || 0, cp.right || 0, cp.bottom || 0, cp.left || 0] as any
    }
    return {
      page: pageOut,
      header: { value: headerValue, attrs: headerAttrs },
      components
    }
  }

  const setCurrentPageId = (id: string | null) => {
    currentPageId.value = id
  }

  const setCurrentPageMeta = (meta: { title?: string; description?: string; name?: string } | null) => {
    currentPageMeta.value = meta
  }

  const updatePageValue = (v: any) => {
    if (typeof v === 'object' && v) {
      page.value = {
        ...page.value,
        ...v
      }
    } else {
      page.value = v
    }

    // 将页面配置中的 navigator.buttons 同步到 header.value
    try {
      const btns = (page.value as any)?.basic?.buttons || (page.value as any)?.navigator?.buttons || {}
      header.value = {
        ...(header.value || {}),
        value: {
          ...(header.value?.value || {}),
          left: { back: !!btns.leftBack, menu: !!btns.leftMenu }
          // 右侧保持原样，不参与显隐控制
        }
      }
    } catch (e) {
      // no-op
    }
  }

  // 从后端返回的装修信息回显到 store
  const applyDecoratePayload = async (payload: any) => {
    if (!payload || typeof payload !== 'object') return
    // 兼容示例 JSON 的包裹结构：如果存在 payload 字段，则以其为准
    const data = payload?.payload ? cloneDeep(payload.payload) : cloneDeep(payload)
    // 应用头部
    const hv = cloneDeep(data.header?.value || {})
    const ha = cloneDeep(data.header?.attrs || {})
    header.value = {
      value: Object.keys(hv).length ? hv : cloneDeep(__initialHeaderValue),
      attrs: Object.keys(ha).length ? ha : cloneDeep(__initialHeaderAttrs)
    }

    // 应用页面级配置（确保 contentPadding 为数组以匹配控件）
    if (data.page) {
      const p = cloneDeep(data.page)
      const cp = p?.basic?.contentPadding
      if (!Array.isArray(cp) && cp && typeof cp === 'object') {
        p.basic.contentPadding = [cp.top || 0, cp.right || 0, cp.bottom || 0, cp.left || 0]
      }
      page.value = p
    }

    // 应用组件列表
    pageComponents.value = []
    const list = Array.isArray(data.components) ? data.components : []
    for (const item of list) {
      const key = item.key
      if (!key) continue
      const pkg = await loadComponentPackage(key)
      const name = (componentsCatalog.value.find(m => m.key === key)?.name) || item.name || key
      const schema: Schema = (pkg.manifest?.schema as any) ?? ({ type: 'object', properties: {} } as any)
      const initial = (pkg.manifest as any).default ?? pkg.manifest.defaultAttrs ?? (schema as any)?.default ?? {}
      pageComponents.value.push({
        id: uuid(),
        key,
        name,
        schema,
        // 兼容旧字段 value 与新字段 config
        value: cloneDeep(defaultsDeep((item as any).config ?? item.value ?? {}, initial)),
        attrs: cloneDeep(item.attrs ?? {}),
        enabled: item.enabled !== false,
        component: pkg.render
      })
    }
    // 默认激活头部，避免没有激活项导致属性面板空白
    activeId.value = ''
  }

  const findIndexById = (id: string) => pageComponents.value.findIndex((c) => c.id === id)

  const removeComponent = (id: string) => {
    const idx = findIndexById(id)
    if (idx < 0) return
    pageComponents.value.splice(idx, 1)
    if (activeId.value === id) {
      // 选中移除后，激活相邻项
      const next = pageComponents.value[idx] || pageComponents.value[idx - 1] || null
      activeId.value = next ? next.id : null
    }
  }

  const moveComponentUp = (id: string) => {
    const idx = findIndexById(id)
    if (idx > 0) {
      const [item] = pageComponents.value.splice(idx, 1)
      pageComponents.value.splice(idx - 1, 0, item)
    }
  }

  const moveComponentDown = (id: string) => {
    const idx = findIndexById(id)
    if (idx >= 0 && idx < pageComponents.value.length - 1) {
      const [item] = pageComponents.value.splice(idx, 1)
      pageComponents.value.splice(idx + 1, 0, item)
    }
  }

  const moveComponentTop = (id: string) => {
    const idx = findIndexById(id)
    if (idx > 0) {
      const [item] = pageComponents.value.splice(idx, 1)
      pageComponents.value.unshift(item)
    }
  }

  const moveComponentBottom = (id: string) => {
    const idx = findIndexById(id)
    if (idx >= 0 && idx < pageComponents.value.length - 1) {
      const [item] = pageComponents.value.splice(idx, 1)
      pageComponents.value.push(item)
    }
  }

  const addComponentAt = async (key: string, refId: string, pos: 'above' | 'below' = 'below') => {
    const meta = componentsCatalog.value.find((m) => m.key === key)
    if (!meta) return
    const pkg = await loadComponentPackage(key)
    const id = uuid()
    const schema: Schema = (pkg.manifest?.schema as any) ?? ({ type: 'object', properties: {} } as any)
    const initial = (pkg.manifest as any).default ?? pkg.manifest.defaultAttrs ?? schema?.default ?? {}
    const value = cloneDeep(initial)
    const pageItem: PageComponent = {
      id,
      key,
      name: meta.name,
      schema,
      value,
      attrs: (pkg.manifest as any).defaultAttrs ?? {},
      enabled: true,
      component: pkg.render
    }
    const idx = findIndexById(refId)
    const insertIndex = idx < 0 ? pageComponents.value.length : pos === 'above' ? idx : idx + 1
    pageComponents.value.splice(insertIndex, 0, pageItem)
    activeId.value = id
  }

  const copyComponent = (id: string) => {
    const idx = findIndexById(id)
    if (idx < 0) return
    const src = pageComponents.value[idx]
    const copy: PageComponent = {
      id: uuid(),
      key: src.key,
      name: src.name,
      schema: src.schema,
      value: cloneDeep(src.value),
      attrs: cloneDeep(src.attrs),
      enabled: src.enabled !== false,
      component: src.component
    }
    pageComponents.value.splice(idx + 1, 0, copy)
    activeId.value = copy.id
  }

  const updateActiveValue = (v: any) => {
    const current = pageComponents.value.find(c => c.id === activeId.value)
    if (!current) return
    // 简单合并对象值
    if (typeof v === 'object' && v) {
      current.value = {
        ...current.value,
        ...v
      }
    } else {
      current.value = v
    }
  }

  const updateActiveAttrs = (attrs: any) => {
    const current = pageComponents.value.find((c) => c.id === activeId.value)
    if (!current) return
    if (typeof attrs === 'object' && attrs) {
      current.attrs = {
        ...(current.attrs || {}),
        ...attrs
      }
    } else {
      current.attrs = attrs
    }
  }

  const updateActiveEnabled = (enabled: boolean) => {
    const current = pageComponents.value.find((c) => c.id === activeId.value)
    if (!current) return
    current.enabled = !!enabled
  }

  return {
    isLoading,
    loadAll,
    componentsCatalog,
    activeComponent,
    header,
    packages,
    pageComponents,
    activeId,
    zoom,
    page,
    pageKind,
    pageSchema,
    pageValue: computed(() => page.value),
    reset,
    addComponent,
    setActive,
    setActiveHeader,
    setZoom,
    currentPageId,
    currentPageMeta,
    setCurrentPageId,
    setCurrentPageMeta,
    setPageKind,
    updatePageValue,
    applyDecoratePayload,
    buildDecoratePayload,
    updateActiveValue
    , updateActiveAttrs
    , updateActiveEnabled
    , removeComponent
    , moveComponentUp
    , moveComponentDown
    , moveComponentTop
    , moveComponentBottom
    , addComponentAt
    , copyComponent
  }
})