import { computed, defineComponent, PropType } from 'vue'
import { DeckComponentConfig } from '../../types'
import { DeckRender } from '../../index'
import { withUnit } from '@pkg/utils'
import './style.scss'

export default defineComponent({
  name: 'd_container',
  props: {
    comp: {
      type: Object as PropType<DeckComponentConfig<any>>,
      required: true
    },
    config: {
      type: Object as PropType<any>,
      required: true
    }
  },
  setup(props) {
    const childComponents = computed(() => {
      return props.comp.children || []
    })

    const styleRef = computed(() => {
      const linearGradientEnable = props.config?.linearGradientEnable ?? false
      const {
        deg = 180,
        from = 'rgba(255, 0, 0, 0.1)',
        to = 'rgba(255, 255, 255, 0.1)',
        fromStop = 0,
        toStop = 100
      } = props.config?.linearGradient || {}

      const {
        enable: borderEnable = false,
        shape: borderShape = 'solid',
        width: borderWidth = 1,
        color: borderColor = '#000000'
      } = props.config?.border || {}

      return {
        backgroundImage: linearGradientEnable && `linear-gradient(${deg}deg, ${from} ${fromStop}%, ${to} ${toStop}%)`,
        ...(borderEnable
          ? {
              borderWidth: withUnit(borderWidth),
              borderStyle: borderShape,
              borderColor: borderColor
            }
          : {})
      }
    })

    return () => {
      if (childComponents.value.length === 0) {
        return null
      }
      return (
        <div class="d_container" style={styleRef.value}>
          <DeckRender components={childComponents.value} />
        </div>
      )
    }
  }
})
