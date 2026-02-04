import { RangePicker } from '@pkg/ui'
import { defineComponent } from 'vue'
import { CommonWidgetPropsDefine } from '../../../../types/widget'

export default defineComponent({
  name: 'sw_range-picker',
  props: CommonWidgetPropsDefine,
  setup(props) {
    return () => {
      return <RangePicker showTime={true} valueFormat="YYYY-MM-DD HH:mm:ss" {...props} />
    }
  }
})
