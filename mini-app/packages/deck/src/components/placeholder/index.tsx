import { PropType, computed, defineComponent } from 'vue'
import './style.scss'
import { withUnit } from '@pkg/utils'
import { DeckComponentConfig } from '../types'

export default defineComponent({
  name: 'C_Placeholder',
  props: {
    config: {
      type: Object as PropType<
        DeckComponentConfig<{
          height: number
          separator: {
            enable: boolean
            color: string
            shape: string
            width: number
          }
        }>
      >,
      required: true
    }
  },
  setup(props) {
    const separator = computed(() => {
      const { enable, color, shape, width } = props.config.separator
      return {
        visible: enable,
        style: {
          borderTop: `${withUnit(width ?? 1)} ${shape} ${color}`
        }
      }
    })
    const style = computed(() => {
      const { height = 0 } = props?.config ?? {}
      return {
        height: withUnit(height)
      }
    })
    return () => {
      return (
        <div class="c_placeholder" style={style.value}>
          {separator.value.visible && <div class="c_placeholder__separator" style={separator.value.style}></div>}
        </div>
      )
    }
  }
})
