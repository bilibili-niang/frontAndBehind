import { defineComponent } from 'vue'
import { commonFieldPropsDefine } from '../types/field'
import { useCommonField } from '../utils/field'
import { mountWidgetRef } from '../pluginsInject'

// 该类型无实际意义，仅作为插槽使用。
export default defineComponent({
  name: 'NullField',
  props: {
    ...commonFieldPropsDefine
  },
  setup(props) {
    const { widgetRef, propsRef } = useCommonField(props)
    return () => {
      const Widget = widgetRef.value
      return <Widget {...propsRef.value} {...mountWidgetRef(propsRef.value)} onChange={() => {}} />
    }
  }
})
