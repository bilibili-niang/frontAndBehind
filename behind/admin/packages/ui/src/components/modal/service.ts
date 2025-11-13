import { createVNode, render, reactive, type AppContext, type VNode, type Component, h } from 'vue'
import { VDialog, VCard, VCardTitle, VCardText, VCardActions, VDivider } from 'vuetify/components'
import { _getUiAppContext } from '../notify/index'

export type ModalServiceSlots = {
  content?: () => VNode | VNode[] | null
  actions?: () => VNode | VNode[] | null
}

export type ModalServiceOptions = {
  title?: string
  width?: number | string
  maxWidth?: number | string
  persistent?: boolean
  // 内容可以是渲染函数或 VNode
  content?: VNode | (() => VNode | VNode[] | null)
  actions?: VNode | (() => VNode | VNode[] | null)
}

export type ModalServiceController = {
  open: () => void
  close: () => void
  update: (opts: Partial<ModalServiceOptions>) => void
  setTitle: (title?: string) => void
  setContent: (content?: ModalServiceOptions['content']) => void
  setActions: (actions?: ModalServiceOptions['actions']) => void
  destroy: () => void
}

function toSlot(v?: VNode | (() => VNode | VNode[] | null)): (() => VNode | VNode[] | null) | undefined {
  if (!v) return undefined
  if (typeof v === 'function') return v as any
  return () => v
}

export function createModal(opts: ModalServiceOptions = {}): ModalServiceController {
  const state = reactive({
    model: false,
    title: opts.title ?? '',
    width: opts.width ?? 480,
    maxWidth: opts.maxWidth,
    persistent: !!opts.persistent,
    content: toSlot(opts.content),
    actions: toSlot(opts.actions),
  }) as any

  const vnode = createVNode(
    VDialog as unknown as Component,
    {
      modelValue: state.model,
      'onUpdate:modelValue': (v: boolean) => { state.model = v; if (!v) /* noop */ null },
      width: state.width,
      maxWidth: state.maxWidth,
      persistent: state.persistent,
    },
    {
      default: () => h(
        VCard as unknown as Component,
        {},
        {
          default: () => [
            state.title ? h(VCardTitle as unknown as Component, { class: 'text-subtitle-1 font-semibold' }, { default: () => state.title }) : null,
            state.title ? h(VDivider as unknown as Component) : null,
            h(VCardText as unknown as Component, {}, { default: () => state.content?.() ?? null }),
            state.actions ? h(VDivider as unknown as Component) : null,
            state.actions ? h(VCardActions as unknown as Component, {}, { default: () => state.actions?.() ?? null }) : null,
          ]
        }
      )
    }
  )

  const appContext: AppContext | null = _getUiAppContext()
  if (appContext) vnode.appContext = appContext

  const container = document.createElement('div')

  function mount() {
    document.body.appendChild(container)
    render(vnode, container)
  }

  function unmount() {
    render(null, container)
    container.parentNode?.removeChild(container)
  }

  const controller: ModalServiceController = {
    open() { state.model = true },
    close() { state.model = false },
    update(patch) {
      if (patch.title !== undefined) state.title = patch.title
      if (patch.width !== undefined) state.width = patch.width
      if (patch.maxWidth !== undefined) state.maxWidth = patch.maxWidth
      if (patch.persistent !== undefined) state.persistent = patch.persistent
      if (patch.content !== undefined) state.content = toSlot(patch.content)
      if (patch.actions !== undefined) state.actions = toSlot(patch.actions)
    },
    setTitle(title) { state.title = title ?? '' },
    setContent(content) { state.content = toSlot(content) },
    setActions(actions) { state.actions = toSlot(actions) },
    destroy() { unmount() },
  }

  // 初次挂载
  mount()

  return controller
}
