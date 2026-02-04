import { defineComponent } from 'vue'
import { CommonWidgetPropsDefine } from '../../../../types/widget'
import { TimeRangePicker } from '@pkg/ui'

export default defineComponent({
  name: 'sw_time-range',
  props: CommonWidgetPropsDefine,
  setup(props) {
    return () => {
      return (
        <TimeRangePicker
          valueFormat="HH:mm:ss"
          placeholder={['开始', '结束']}
          {...props.config}
          // style="width: 100%"
          value={props.value}
          onChange={props.onChange}
        />
      )
    }
  }
})
