import { TimeRangePicker } from '@anteng/ui'
import { defineComponent, ref } from 'vue'
import './styles/time-picker.scss'
import { commonSearchTableWidgetPropsDefine } from './types'

export default defineComponent({
  name: 'fw_time-range-picker',
  props: commonSearchTableWidgetPropsDefine,
  setup(props) {
    const isFocus = ref(false)
    return () => {
      return (
        <div class={['btp__filter-widget', isFocus.value && '--focus']}>
          <label>{props.label}</label>
          <TimeRangePicker
            {...props.config}
            bordered={false}
            onFocus={(e: any) => {
              isFocus.value = true
              props.config?.onFocus?.(e)
            }}
            onBlur={(e: any) => {
              isFocus.value = false
              props.config?.onBlur?.(e)
            }}
            onChange={props.onChange}
          />
        </div>
      )
    }
  }
})
