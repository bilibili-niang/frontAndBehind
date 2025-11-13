// 装修组件下调用的图片组件
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DeckImage',
  props: {
    config: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  emits: [''],
  setup(props, { emit }) {
    const { config } = props
    return () => {
      const style: Record<string, any> = {}
      const width = (config as any)?.width
      const height = (config as any)?.height
      const mode = (config as any)?.mode || 'fill'
      const position = (config as any)?.position || 'center'
      const positionX = (config as any)?.positionX
      const positionY = (config as any)?.positionY

      const toPx = (v: any, fallback?: string) => {
        if (typeof v === 'number') return `${v}px`
        if (typeof v === 'string' && v.trim().length > 0) return v
        return fallback ?? undefined
      }

      // 默认最大宽度不超过容器
      style.maxWidth = '100%'
      style.display = 'block'

      if (mode === 'original') {
        style.width = 'auto'
        style.height = 'auto'
        style.objectFit = 'unset'
      } else {
        style.width = toPx(width, '100%')
        style.height = toPx(height, 'auto')
        switch (mode) {
          case 'cover':
            style.objectFit = 'cover'
            break
          case 'fit':
          case 'contain':
            style.objectFit = 'contain'
            break
          case 'fill':
          default:
            style.objectFit = 'fill'
            break
        }
      }

      // 计算图形位置（裁剪焦点）
      const mapPosition = (p: string) => {
        switch (p) {
          case 'top': return 'top center'
          case 'bottom': return 'bottom center'
          case 'left': return 'left center'
          case 'right': return 'right center'
          case 'top-left': return 'left top'
          case 'top-right': return 'right top'
          case 'bottom-left': return 'left bottom'
          case 'bottom-right': return 'right bottom'
          case 'center':
          default: return 'center center'
        }
      }
      if (position === 'custom' && typeof positionX === 'number' && typeof positionY === 'number') {
        style.objectPosition = `${positionX}% ${positionY}%`
      } else {
        style.objectPosition = mapPosition(position)
      }

      return (
        <img
          class="deck-image"
          src={(config as any)?.src}
          alt={(config as any)?.alt}
          style={style}
        />
      )
    }
  }
})
