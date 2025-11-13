import { defineComponent } from 'vue'
import { commonFieldPropsDefine } from '../types/field'
import { useCommonField } from '../utils/field'
import { Button } from '@anteng/ui'
import { mountWidgetRef } from '../pluginsInject'

export default defineComponent({
  name: 'StringField',
  props: {
    ...commonFieldPropsDefine
  },
  setup(props) {
    const handleStringFieldChange = (v: any) => {
      props.onChange(v ?? '')
    }

    const { widgetRef, propsRef } = useCommonField(props)

    return () => {
      const Widget = widgetRef.value
      return <Widget {...propsRef.value} {...mountWidgetRef(propsRef.value)} onChange={handleStringFieldChange} />
    }
  }
})
