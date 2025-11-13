import { type App, type AppContext, createVNode, nextTick, reactive, render } from 'vue'
import { VBtn, VIcon, VSnackbar } from 'vuetify/components'

export type NotifyOptions = {
  text: string
  color?: string
  timeout?: number
  location?: 'top' | 'bottom' | 'top start' | 'top end' | 'bottom start' | 'bottom end'
  icon?: string
  variant?: 'flat' | 'text' | 'elevated' | 'tonal' | 'outlined' | 'plain'
}

let container: HTMLElement | null = null
let appContext: AppContext | null = null

export function installNotify(app: App) {
  appContext = app._context
}

// 供内部复用（例如程序化 Modal 组件）
export function _getUiAppContext() {
  return appContext
}

export function notify(opts: NotifyOptions) {
  const state = reactive({
    model: true,
    text: opts.text,
    color: opts.color ?? 'primary',
    timeout: opts.timeout ?? 2500,
    location: opts.location ?? 'top end',
    icon: opts.icon ?? 'mdi-check-circle-outline',
    variant: opts.variant ?? 'tonal',
  }) as any

  const defaultSlot = () =>
    createVNode('div', { class: 'flex items-center' }, [
      createVNode(VIcon as any, { class: 'mr-2', icon: state.icon }),
      createVNode('span', null, state.text),
    ])

  const actionsSlot = () =>
    createVNode(VBtn as any, {
      variant: 'text', onClick: () => {
        state.model = false
      }
    }, { default: () => '关闭' })

  const vnode = createVNode(
    VSnackbar as any,
    {
      modelValue: state.model,
      'onUpdate:modelValue': (v: boolean) => {
        state.model = v
        if (!v) cleanup()
      },
      timeout: state.timeout,
      location: state.location,
      color: state.color,
      rounded: 'lg',
      variant: state.variant,
      transition: 'slide-x-reverse-transition',
    },
    {
      default: defaultSlot,
      actions: actionsSlot,
    }
  )

  // 关键：让程序化渲染的节点继承宿主应用的 appContext（包含 Vuetify 注入）
  if (appContext) vnode.appContext = appContext

  function mount() {
    container = document.createElement('div')
    document.body.appendChild(container)
    render(vnode, container)
  }

  function cleanup() {
    if (container) {
      render(null, container)
      container.parentNode?.removeChild(container)
      container = null
    }
  }

  nextTick(mount)
}

export function notifySuccess(text: string, opts: Omit<NotifyOptions, 'text' | 'color' | 'icon'> = {}) {
  notify({ text, color: 'success', icon: 'mdi-check-circle-outline', ...opts })
}

export function notifyError(text: string, opts: Omit<NotifyOptions, 'text' | 'color' | 'icon'> = {}) {
  notify({ text, color: 'error', icon: 'mdi-alert-circle-outline', ...opts })
}
