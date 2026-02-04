import { Switch, type SwitchProps } from 'ant-design-vue'
import './style.scss'

import { defineComponent, ref } from 'vue'
import { PREFIX_CLS } from '@pkg/config'

export default defineComponent<SwitchProps>({
  name: `${PREFIX_CLS}-switch`,
  props: {
    ...Switch.props
  },
  setup(props) {
    const loadingRef = ref(false)
    const handleChange = async (checked: any, e: Event) => {
      loadingRef.value = true
      try {
        await props.onChange?.(checked, e)
        loadingRef.value = false
      } catch (err) {
        loadingRef.value = false
      }
    }
    return () => {
      const { onChange, loading, ...nativeProps } = props
      return <Switch {...nativeProps} loading={loading ?? loadingRef.value} onChange={handleChange}/>
    }
  }
})
