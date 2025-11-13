import { defineComponent } from 'vue'
import { commonFieldPropsDefine } from '../types/field'
import { useCommonField } from '../utils/field'
import { mountWidgetRef } from '../pluginsInject'

export default defineComponent({
  name: 'BooleanField',
  props: {
    ...commonFieldPropsDefine
  },
  setup(props) {
    const handleChange = (v: any) => {
      props.onChange(v ?? false)
    }

    const { widgetRef, propsRef } = useCommonField(props)

    return () => {
      const Widget = widgetRef.value
      return <Widget {...propsRef.value} {...mountWidgetRef(propsRef.value)} onChange={handleChange} />
    }
  }
})
