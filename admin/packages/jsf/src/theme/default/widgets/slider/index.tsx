import { defineComponent } from 'vue'
import { InputNumber, Slider } from '@pkg/ui'
import './style.scss'
import { CommonWidgetPropsDefine } from '../../../../types/widget'
import { getWidgetConfig } from '../../../../utils/widget'

export default defineComponent({
  name: 'Widget_Slider',
  props: CommonWidgetPropsDefine,
  setup(props) {
    const min = getWidgetConfig(props.schema, 'min')
    const max = getWidgetConfig(props.schema, 'max')
    const suffix = getWidgetConfig(props.schema, 'suffix')
    const prefix = getWidgetConfig(props.schema, 'prefix')
    const range = getWidgetConfig(props.schema, 'range')
    return () => {
      const v = (props.value ?? (range ? [] : 0)) as number
      return (
        <div class={['widget-slider', range && 'widget-slider--range']}>
          <Slider
            class="widget-slider__slider"
            {...props.config}
            min={min}
            max={max}
            value={v}
            onChange={props.onChange}
          />
          {!range && (
            <InputNumber
              class="w_number widget-slider__input"
              {...props.config}
              prefix={prefix}
              addonAfter={suffix}
              min={min}
              max={max}
              value={v}
              onChange={props.onChange}
            />
          )}
        </div>
      )
    }
  }
})
