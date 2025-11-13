// 通用组件-图片
import './index.scss'
import { defineComponent } from 'vue'
import { DeckImage } from '@anteng/ui'
import manifest from './manifest'

export { manifest }

export const render = defineComponent({
  name: 'ImageDecoration',
  props: {
    src: { type: String, default: manifest.default.src },
    alt: { type: String, default: manifest.default.alt },
    width: { type: [Number, String] as any, default: manifest.default.width },
    height: { type: [Number, String] as any, default: manifest.default.height },
    mode: {
      type: String,
      default: manifest.default.mode
    },
    position: { type: String, default: manifest.default.position },
    positionX: { type: Number, default: manifest.default.positionX },
    positionY: { type: Number, default: manifest.default.positionY }
  },
  setup(props) {
    return () => (
      <DeckImage
        config={props}
      />
    )
  }
})