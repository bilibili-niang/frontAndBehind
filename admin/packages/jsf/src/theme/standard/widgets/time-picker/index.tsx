import { defineComponent } from 'vue'
import { CommonWidgetPropsDefine } from '../../../../types/widget'
import { TimePicker } from '@anteng/ui'

export default defineComponent({
  name: 'sw_time-picker',
  props: CommonWidgetPropsDefine,
  setup(props) {
    return () => {
      return (
        <TimePicker
          valueFormat="HH:mm:ss"
          placeholder="选择时间"
          {...props.config}
          value={props.value}
          onChange={props.onChange}
        />
      )
    }
  }
})
