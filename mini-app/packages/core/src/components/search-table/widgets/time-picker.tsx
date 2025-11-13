import { TimePicker } from '@anteng/ui'
import { defineComponent, ref } from 'vue'
import './styles/time-picker.scss'
import { commonSearchTableWidgetPropsDefine } from './types'
import dayjs from 'dayjs'

export default defineComponent({
  name: 'fw_time-picker',
  props: commonSearchTableWidgetPropsDefine,
  setup(props) {
    const isFocus = ref(false)
    const value = ref(props.value ? dayjs(`1997-01-01 ${props.value}`) : null)
    const onChange: any = (d: dayjs.Dayjs, v: string) => {
      props.onChange?.(v)
    }
    return () => {
      return (
        <div class={['btp__filter-widget', isFocus.value && '--focus']}>
          <label>{props.label}</label>
          <TimePicker
            {...props.config}
            value={value.value as any}
            bordered={false}
            onFocus={(e) => {
              isFocus.value = true
              props.config?.onFocus?.(e)
            }}
            onBlur={(e) => {
              isFocus.value = false
              props.config?.onBlur?.(e)
            }}
            onChange={onChange}
          />
        </div>
      )
    }
  }
})
