import { createVNode, render } from 'vue'
import { defaultsDeep } from 'lodash'
import ContextMenu, { type ContextMenuConfig, type ContextMenuItem } from '../components/context-menu'

let lastClickEvent = new MouseEvent('click')
const collectClickEvent = (e: MouseEvent) => {
  lastClickEvent = e
}
document.addEventListener('click', collectClickEvent, true)
document.addEventListener('contextmenu', collectClickEvent, true)

function useContextMenu(e: MouseEvent = lastClickEvent, config: ContextMenuConfig) {
  e = e || lastClickEvent
  e.stopPropagation()
  e.preventDefault()

  const container = document.createElement('div')
  container.className = 'ice-ui-modal-root'
  document.body.append(container)

  const cancel = () => {
    document.removeEventListener('mousedown', cancel, true)
    document.removeEventListener('contextmenu', cancel, true)

    // FIXME 这里并没有销毁虚拟节点
    document.body.removeChild(container)
    _config.onClose()
  }

  document.addEventListener('mousedown', cancel, true)
  document.addEventListener('contextmenu', cancel, true)

  const _config = defaultsDeep(
    {
      x: e.pageX,
      y: e.pageY,
      list: []
    },
    config
  )

  _config.onClose = (...arg: any) => {
    config.onClose?.(...arg)
  }

  const ContextMenuInstance = createVNode(ContextMenu, {
    config: _config,
    key: (Math.random() * 1000).toString(),
    onClose: () => {
      _config.onClose()
    }
  })
  render(ContextMenuInstance, container!)

}

export default useContextMenu
export { ContextMenu, type ContextMenuConfig, type ContextMenuItem }
