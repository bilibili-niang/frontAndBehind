import { DatePicker } from '@pkg/ui'
import { defineComponent, ref } from 'vue'
import './styles/date-picker.scss'
import { commonSearchTableWidgetPropsDefine } from './types'

export default defineComponent({
  name: 'fw_date-picker',
  props: commonSearchTableWidgetPropsDefine,
  setup(props) {
    const isFocus = ref(false)
    return () => {
      return (
        <div class={['btp__filter-widget', isFocus.value && '--focus']}>
          <label>{props.label}</label>
          <DatePicker
            showTime={true}
            valueFormat="YYYY-MM-DD HH:mm:ss"
            {...props.config}
            value={props.value as any}
            bordered={false}
            onFocus={(...e) => {
              isFocus.value = true
              props.config?.onFocus?.(...e)
            }}
            onBlur={(...e) => {
              isFocus.value = false
              props.config?.onBlur?.(...e)
            }}
            onChange={props.onChange}
          />
        </div>
      )
    }
  }
})
