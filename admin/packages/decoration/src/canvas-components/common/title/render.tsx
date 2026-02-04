import { PropType, computed, defineComponent } from 'vue'
import './style.scss'
import { DeckComponent } from '../../../stores/canvas'
import { withUnit } from '../../../canvas-components/utils'
import { ActionItem, ImageDefine, useAction } from '@pkg/core'

export { default as manifest } from './manifest'

export type FontDefine = {
  fontFamily?: string
  fontSize?: number
  lineHeight?: number
  fontWeight?: string
  color?: string
  letterSpacing?: number
  textAlign?: 'left' | 'center' | 'right' | 'justify'
}

type TileComp = {
  content: string
  font: FontDefine
  action: ActionItem
  arrow: {
    enable: boolean
    color: string
    size: number
    text: string
    offsetX: number
    offsetY: number
  }
  prefixIconEnable?: boolean
  prefixIcon?: {
    image: ImageDefine
    width: number
    height: number
    objectFit: string
    marginRight: number
  }
}

export default defineComponent({
  name: 'C_Title',
  props: {
    comp: {
      type: Object as PropType<DeckComponent<TileComp>>,
      required: true
    },
    config: {
      type: Object as PropType<TileComp>,
      required: true
    }
  },
  setup(props) {
    const fontStyle = computed(() => {
      const { fontFamily, fontSize, fontWeight, color, lineHeight, letterSpacing, textAlign } =
        props.config.font
      const { enable, size } = props.config.arrow
      return {
        flex: 'auto',
        fontFamily,
        color,
        fontSize: withUnit(fontSize),
        fontWeight,
        lineHeight: withUnit(lineHeight),
        letterSpacing: withUnit(letterSpacing),
        textAlign,
        paddingLeft: enable && textAlign === 'center' ? withUnit(size) : undefined
      }
    })
    const arrowStyle = computed(() => {
      const { color, size, offsetX, offsetY } = props.config.arrow
      return {
        color,
        fontSize: withUnit(size),
        transform: `translate3d(${withUnit(offsetX)}, ${withUnit(offsetY)}, 0)`
      }
    })

    const prefixIcon = computed(() => {
      const { prefixIconEnable, prefixIcon } = props.config
      if (!prefixIconEnable || !prefixIcon?.image?.url) {
        return null
      }
      const { width = 24, height = 24, objectFit = 'fill', marginRight = 0 } = prefixIcon
      return {
        url: prefixIcon.image.url,
        style: {
          backgroundImage: `url(${prefixIcon.image.url})`,
          width: withUnit(width),
          height: withUnit(height),
          objectFit: objectFit as any,
          backgroundSize: objectFit === 'fill' ? '100% 100%' : objectFit,
          marginRight: withUnit(marginRight)
        }
      }
    })

    return () => {
      return (
        <div class="c_title" onClick={() => useAction(props.config.action)}>
          {prefixIcon.value && (
            <div class="c_title__prefix-icon" style={prefixIcon.value.style}></div>
          )}
          <div class="c_title__content" style={fontStyle.value}>
            {props.config.content}
          </div>
          {props.config.arrow.enable && (
            <div class="c_title__arrow-wrapper">
              <div class="c_title__arrow" style={arrowStyle.value}>
                <span class="c_title__arrow-text">{props.config.arrow.text}</span>
                <div class="c_title__arrow-icon iconfont icon-right"></div>
              </div>
            </div>
          )}
        </div>
      )
    }
  }
})
