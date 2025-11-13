import { computed, defineComponent, type PropType } from 'vue'
import './style.scss'
import { CommonWidgetPropsDefine } from '../../../../types/widget'
import { getWidgetConfig } from '../../../../utils/widget'

export const RadioButton = defineComponent({
  name: 'RatioButtonWidget',
  props: {
    options: {
      type: Array as PropType<
        {
          label: string
          value: any
          color?: string
        }[]
      >,
      default: () => []
    },
    value: {}
  },
  emits: ['change'],
  setup(props, { emit }) {
    return () => {
      return (
        <div class="widget-radio-button clickable">
          {props.options.map((item) => {
            return (
              <div
                class={['widget-radio-button__item', item.value === props.value && '--active', item.color]}
                onClick={() => emit('change', item.value)}
              >
                {item.label}
              </div>
            )
          })}
          {props.options.length === 0 && <div class="widget-radio-button__disabled">无可用选项</div>}
        </div>
      )
    }
  }
})

export default defineComponent({
  name: 'Widget_RatioButton',
  props: CommonWidgetPropsDefine,
  setup(props) {
    const options = computed(() => {
      const v = getWidgetConfig(props.schema, 'options')
      return Array.isArray(v) ? v : []
    })
    return () => {
      return <RadioButton {...props.config} options={options.value} value={props.value} onChange={props.onChange} />
    }
  }
})
