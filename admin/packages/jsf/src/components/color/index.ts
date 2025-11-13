import { createVNode } from 'vue'
import './style.scss'
import Color, { type ColorModalCfg } from './Color'
import { withModal } from '../modal'

let timer: any = null
let modal: any = null
let color: any = null
function setup() {
  color = createVNode(Color, {})
  modal = withModal(color, {
    title: '颜色填充',
    logo: createVNode('iconpark-icon', { name: 'fill' })
  })
  document.getElementById('app')?.addEventListener(
    'mousedown',
    (e) => {
      if (modal.visible) {
        timer = setTimeout(() => {
          modal.close()
        }, 32)
      }
    },
    true
  )
}

// FIXME 在 JSX 热更新下好像会另外创建VNode，导致DOM指向的VNode和热更新之前的VNode不是同一个
export function useColorModal(config: ColorModalCfg) {
  clearTimeout(timer)
  if (!modal) {
    setup()
  }
  modal.show()
  modal.onClose = () => {
    close()
    config.onClose?.()
  }
  color.component!.update()
  const { show, close } = color.component!.exposed!
  return show(config) as (cfg: ColorModalCfg) => void
}
;[]

export { rgb2hex, hex2rgb, rgb2hsv, hsv2rgb } from './utils'
export type { RGB, RGBA, HSV } from './utils'
export { type ColorModalCfg }
export default Color
;(window as any).useColorModal = useColorModal
