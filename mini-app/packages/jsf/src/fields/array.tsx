import { defineComponent } from 'vue'
import { commonFieldPropsDefine } from '../types/field'
import { useCommonField } from '../utils/field'
import { mountWidgetRef } from '../pluginsInject'

export default defineComponent({
  name: 'ArrayField',
  props: {
    ...commonFieldPropsDefine
  },
  setup(props) {
    const handleArrayFieldChange = (value: any) => {
      props.onChange(Array.isArray(value) ? value : [])
    }

    const { widgetRef, propsRef } = useCommonField(props)

    return () => {
      const Widget = widgetRef.value
      return (
        <Widget
          class="jsf_field--array"
          {...propsRef.value}
          {...mountWidgetRef(propsRef.value)}
          onChange={handleArrayFieldChange}
        />
      )
    }
  }
})
