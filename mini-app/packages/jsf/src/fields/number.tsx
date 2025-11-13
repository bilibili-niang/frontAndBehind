import { defineComponent } from 'vue'
import { commonFieldPropsDefine } from '../types/field'
import { useCommonField } from '../utils/field'
import { mountWidgetRef } from '../pluginsInject'

export default defineComponent({
  name: 'NumberField',
  props: {
    ...commonFieldPropsDefine
  },
  setup(props) {
    const handleNumberFieldChange = (v: any) => {
      props.onChange(Number.isNaN(Number(v)) ? null : v)
    }

    const { widgetRef, propsRef } = useCommonField(props)

    return () => {
      const Widget = widgetRef.value
      return <Widget {...propsRef.value} {...mountWidgetRef(propsRef.value)} onChange={handleNumberFieldChange} />
    }
  }
})
