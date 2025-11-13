import { ConfigProvider, Modal, type ModalFuncProps, type ModalProps } from 'ant-design-vue'
import './index.scss'
import { PREFIX_CLS } from '@anteng/config'
import { createVNode, render as vueRender } from 'vue'
import { CloseOutlined } from '@ant-design/icons-vue'
import { renderAnyNode } from '@anteng/utils'
import zhCN from 'ant-design-vue/locale/zh_CN'

type ConfigUpdate = ModalProps | ((prevConfig: ModalProps) => ModalProps)

Modal.$__zIndex__ = 1000

const getDefaults = (options: ModalFuncProps & { actions?: any }) => {
  const footer = (options as any).footer ?? (options as any).actions ?? undefined
  return {
    ...options,
    footer,
    closeIcon: options.closeIcon ?? <CloseOutlined />,
    cancelText: options.cancelText ?? '取消',
    okText: options.okText ?? '确定',
    prefixCls: options.prefixCls ?? PREFIX_CLS,
    zIndex: options.zIndex ?? (++Modal.$__zIndex__ || undefined)
  }
}

const nativeConfirm = Modal.confirm
;(Modal as any).confirm = (options: ModalFuncProps) => {
  return nativeConfirm(getDefaults(options))
}

const nativeInfo = Modal.info
;(Modal as any).info = (options: ModalFuncProps) => {
  return nativeInfo(getDefaults(options))
}

const nativeWarn = Modal.warn
;(Modal as any).warn = (options: ModalFuncProps) => {
  return nativeWarn(getDefaults(options))
}

const nativeError = Modal.error
;(Modal as any).error = (options: ModalFuncProps) => {
  return nativeError(getDefaults(options))
}

const nativeSuccess = Modal.success
;(Modal as any).success = (options: ModalFuncProps) => {
  return nativeSuccess(getDefaults(options))
}

;(Modal as any).$__zIndex__ = (Modal as any).$__zIndex__ || 1000
;(Modal as any).$__open_count__ = (Modal as any).$__open_count__ || 0

Modal.open = (options: ModalProps & { content: any; actions?: any }) => {
  const container = document.createElement('div')
  document.body.appendChild(container)

  // 锁定页面滚动（仅在第一个弹窗打开时锁定）
  const prevBodyOverflow = document.body.style.overflow
  if ((Modal as any).$__open_count__++ === 0) {
    document.body.style.overflow = 'hidden'
  }

  let currentConfig = getDefaults({
    ...options,
    footer: (options as any).footer ?? (options as any).actions ?? undefined,
    closeIcon: options.closeIcon ?? <CloseOutlined />,
    width: options.width ?? 'auto',
    onClose: close,
    open: true
  }) as any

  let modalInstance: any = null
  let isClosing = false

  function destroy(...args: any[]) {
    if (modalInstance) {
      try {
        vueRender(null, container as any)
      } finally {
        modalInstance = null
        container.parentNode && container.parentNode.removeChild(container)
        // 恢复页面滚动（当最后一个弹窗关闭时）
        if (--(Modal as any).$__open_count__ === 0) {
          document.body.style.overflow = prevBodyOverflow
        }
      }
    }
  }

  function close(this: typeof close, ...args: any[]) {
    if (isClosing || !modalInstance) return
    isClosing = true
    currentConfig = {
      ...currentConfig,
      open: false,
      afterClose: () => {
        try {
          if (typeof options.afterClose === 'function') {
            options.afterClose()
          }
        } finally {
          destroy.apply(this, args)
          isClosing = false
        }
      }
    }
    update(currentConfig)
  }
  function update(configUpdate: ConfigUpdate) {
    if (typeof configUpdate === 'function') {
      currentConfig = configUpdate(currentConfig)
    } else {
      currentConfig = {
        ...currentConfig,
        ...configUpdate
      }
    }
    if (modalInstance) {
      Object.assign(modalInstance.component.props, currentConfig)
      modalInstance.component.update()
    }
  }

  const Wrapper = (props: ModalProps & { footer?: any }) => {
    const footerNode = props.footer === undefined ? null : renderAnyNode(props.footer)
    return (
      <ConfigProvider prefixCls={PREFIX_CLS} locale={zhCN}>
        <Modal
          {...props}
          onUpdate:open={(v) => !v && close.apply(modalInstance)}
          footer={footerNode}
          prefixCls={`${PREFIX_CLS}-modal`}
        >
          {renderAnyNode(options.content)}
        </Modal>
      </ConfigProvider>
    )
  }

  function render(props: ModalProps) {
    const vm = createVNode(Wrapper, { ...props })
    vueRender(vm, container as any)
    return vm
  }

  modalInstance = render(currentConfig)

  return {
    destroy: close,
    close,
    update
  }
}

export default Modal

export { type ModalFuncProps, type ModalProps }
