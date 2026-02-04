import { defineComponent } from 'vue'
import { CommonWidgetPropsDefine } from '../../../../types/widget'
import { DatePicker } from '@pkg/ui'

export default defineComponent({
  name: 'sw_date-picker',
  props: CommonWidgetPropsDefine,
  setup(props) {
    return () => {
      return (
        <DatePicker
          valueFormat="YYYY-MM-DD"
          placeholder="选择时间"
          {...props.config}
          value={props.value}
          onChange={props.onChange}
        />
      )
    }
  }
})
