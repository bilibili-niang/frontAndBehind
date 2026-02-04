import { defineComponent } from 'vue'
import { CommonWidgetPropsDefine } from '../../../../types/widget'
import { TimePicker } from '@pkg/ui'

export default defineComponent({
  name: 'sw_time',
  props: CommonWidgetPropsDefine,
  setup(props) {
    return () => {
      return (
        <TimePicker
          {...props.config}
          placeholder={'请选择时间'}
          // style="width: 100%"
          value={props.value}
          valueFormat="HH:mm:ss"
          onChange={props.onChange}
        />
      )
    }
  }
})
