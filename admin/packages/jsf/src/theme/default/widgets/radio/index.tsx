import { computed, defineComponent } from 'vue'
import { Radio } from '@pkg/ui'
import { CommonWidgetPropsDefine } from '../../../../types/widget'
import { getWidgetConfig } from '../../../../utils/widget'

export default defineComponent({
  name: 'Widget_Radio',
  props: CommonWidgetPropsDefine,
  setup(props) {
    const options = computed(() => {
      const v = getWidgetConfig(props.schema, 'options')
      return Array.isArray(v) ? v : []
    })

    const handleChange = (e: any) => {
      props.onChange(e.target.value)
    }

    return () => {
      return (
        <Radio.Group value={props.value} onChange={handleChange}>
          {options.value.map((option: any) => (
            <Radio value={option.value}>{option.label}</Radio>
          ))}
        </Radio.Group>
      )
    }
  }
})
