// widget-switch
import './style.scss'
import { Switch } from '@anteng/ui'
import { computed, defineComponent } from 'vue'
import { CommonWidgetPropsDefine } from '../../../../types/widget'
import { COMMON_STATUS_OFF, COMMON_STATUS_ON } from '@anteng/config'

export default defineComponent({
  name: 'w_boolean',
  props: CommonWidgetPropsDefine,
  setup(props, { attrs }) {
    const isNumberMode = computed(() => !!props.config?.numberMode)
    const computedValue = computed(() => {
      return isNumberMode.value ? (props.value === COMMON_STATUS_ON ? true : false) : props.value === true
    })
    const onChange = (v: any) => {
      props.onChange(isNumberMode.value ? (v ? COMMON_STATUS_ON : COMMON_STATUS_OFF) : v)
    }
    return () => {
      return (
        <div class="w_boolean-wrap">
          <Switch class="w_boolean" {...attrs} {...props.config} checked={computedValue.value} onChange={onChange}/>
        </div>
      )
    }
  }
})
