import { createVNode, render } from 'vue'
import Modal, { type ModalConfig } from './Modal'
import { Modal as AntModal, type ModalProps, type ModalFuncProps } from '@pkg/ui'
;(window as any).modals = []

// let container = document.querySelector('.jsf-ui-modal-root')
// if (!container) {
//   container = document.createElement('div')
//   container.className = 'jsf-ui-modal-root jsf-ui'
//   document.body.append(container)
// }

// 记录点击弹出位置
// document.addEventListener('click', e => {
//   console.log(e.pageX, e.pageY)
// }, true)

export function withModal(comp: unknown, config: ModalConfig = {}) {
  const container = document.createElement('div')
  container.className = 'jsf-ui-modal-root jsf-ui'
  document.body.append(container)

  const modalInstance = createVNode(
    Modal,
    {
      ...config,
      key: (Math.random() * 1000).toString(),
      onClose: () => {
        modal.onClose()
      }
    },
    () => [comp]
  )
  const vm = createVNode({
    setup() {
      return () => {
        // return <ConfigProvider {...globalConfig}>{modalInstance}</ConfigProvider>
        return modalInstance
      }
    }
  })
  ;(window as any).modals.push([modalInstance, vm])
  render(vm, container!)
  const modal = {
    ...config,
    visible: false,
    show: (cfg?: ModalConfig) => {
      modal.visible = true
      // modalInstance.component?.update()
      // render(vm, container!)
      modalInstance.component?.exposed?.show(cfg)
      // console.log(modalInstance.el)
    },
    close: () => {
      modal.visible = false
      modalInstance.component?.exposed?.close()
      modal.onClose?.()
    },
    onClose: () => {}
  }
  return modal
}

export default Modal
export { type ModalConfig }

export interface ModalInstance {
  /** 关闭弹窗 */
  destroy: () => void
  /** 更新弹窗配置 */
  update: (newConfig: ModalFuncProps) => void
  /** 禁止关闭 */
  disableClose: () => void
  /** 允许关闭 */
  enableClose: () => void
}

export const useModal = (comp: any, cfg: ModalProps, compProps?: any): ModalInstance => {
  let closable = cfg.closable ?? true
  const modal = AntModal.info({
    closable: true,
    // maskClosable: true,
    centered: true,
    //
    ...cfg,
    class: `jsf-use-modal ${cfg.wrapClassName || ''}`.trim(),
    icon: null,
    width: 'auto',
    //
    content: (
      <div class="jsf-use-modal__content">
        <div class="jsf-use-modal__header">
          <div class="jsf-use-modal__title">
            {cfg.icon && <iconpark-icon name={cfg.icon}></iconpark-icon>}
            {cfg.title}
          </div>
          <i class="jsf-use-modal__close clickable" onClick={() => modal.destroy()}>
            <iconpark-icon name="close-small"></iconpark-icon>
          </i>
        </div>
        {<comp {...compProps} />}
      </div>
    )
  }) as unknown as ModalInstance

  const nativeDestroy = modal.destroy
  modal.destroy = () => {
    closable && nativeDestroy()
  }

  modal.disableClose = () => {
    closable = false
    modal.update({ closable, maskClosable: closable })
  }
  modal.enableClose = () => {
    closable = true
    modal.update({ closable, maskClosable: cfg.maskClosable ?? closable })
  }
  return modal
}
