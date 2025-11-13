import { computed, defineComponent, ref, type PropType, watch } from 'vue'
import { CommonWidgetPropsDefine } from '../../../../types/widget'
import { InputNumber } from '@anteng/ui'
import './style.scss'
import { getWidgetConfig } from '../../../../utils/widget'

export default defineComponent({
  name: 'w_number',
  props: {
    ...CommonWidgetPropsDefine,
    config: {
      type: Object as PropType<{
        decimal?: boolean
      }>
    }
  },
  setup(props) {
    const uiOptions = computed(() => {
      return {
        controls: getWidgetConfig(props.schema, 'controls'),
        prefix: getWidgetConfig(props.schema, 'prefix'),
        suffix: getWidgetConfig(props.schema, 'suffix'),
        min: getWidgetConfig(props.schema, 'min'),
        max: getWidgetConfig(props.schema, 'max'),
        placeholder: getWidgetConfig(props.schema, 'placeholder')
      }
    })

    const valueRef = ref<any>(props.value)
    const handleChange = (v: any) => {
      valueRef.value = v
    }
    watch(
      () => props.value,
      () => {
        valueRef.value = props.value
      }
    )
    const triggerChange = () => {
      if (props.value !== valueRef.value) {
        props.onChange(valueRef.value)
      }
    }

    return () => {
      return (
        <InputNumber
          class="w_number"
          style="width: 100%;"
          {...props.config}
          placeholder={uiOptions.value.placeholder}
          value={valueRef.value}
          onChange={handleChange}
          onBlur={triggerChange}
          onPressEnter={triggerChange}
          controls={uiOptions.value.controls}
          prefix={uiOptions.value.prefix}
          addonAfter={uiOptions.value.suffix}
          min={uiOptions.value.min}
          max={uiOptions.value.max}
        />
      )
    }
  }
})
