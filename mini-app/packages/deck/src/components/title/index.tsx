import { PropType, computed, defineComponent } from 'vue'
import './style.scss'
import { useAction } from '../../hooks/useAction'
import Taro from '@tarojs/taro'
import { DeckComponentConfig } from '../types'
import { withUnit } from '@anteng/utils'

type TileComp = {
  content: string
  // font: FontDefine
  font: any
  action: any
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
    image: any
    width: number
    height: number
    objectFit: string
    marginRight: number
  }
}

export default defineComponent({
  name: 'C_Title',
  props: {
    config: {
      type: Object as PropType<DeckComponentConfig<TileComp>>,
      required: true
    }
  },
  setup(props) {
    const fontStyle = computed(() => {
      const { fontFamily, fontSize, fontWeight, color, lineHeight, letterSpacing, textAlign } = props.config.font
      const { enable, size } = props.config.arrow
      return {
        flex: 'auto',
        fontFamily,
        color,
        fontSize: Taro.pxTransform(fontSize),
        fontWeight,
        lineHeight: lineHeight && Taro.pxTransform(lineHeight),
        letterSpacing: letterSpacing && Taro.pxTransform(letterSpacing),
        textAlign,
        paddingLeft: enable && textAlign === 'center' ? Taro.pxTransform(size) : undefined
      }
    })
    const arrowStyle = computed(() => {
      const { color, size, offsetX, offsetY } = props.config.arrow
      return {
        color,
        fontSize: Taro.pxTransform(size),
        transform: `translate3d(${Taro.pxTransform(offsetX)}, ${Taro.pxTransform(offsetY)}, 0)`
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
          {prefixIcon.value && <div class="c_title__prefix-icon" style={prefixIcon.value.style}></div>}
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
