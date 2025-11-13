import { createVNode, render } from 'vue'
import view, { type Config } from '../components/image-previewer'

export default function usePreviewImage(config: Config) {
  const container = document.body

  let vm = createVNode(view, {
    ...config,
    onClose: () => {
      destroy()
    }
  })

  render(vm, container)

  const destroy = () => {
    render(null, container)
    vm = null as any
  }
}

export { type Config }
