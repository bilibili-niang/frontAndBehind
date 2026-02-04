import { defineComponent } from 'vue'
import { CommonWidgetPropsDefine } from '../../../../types/widget'
import { RangePicker } from '@pkg/ui'

export default defineComponent({
  name: 'RangePicker',
  props: CommonWidgetPropsDefine,
  setup(props) {
    return () => {
      return (
        <RangePicker
          valueFormat="YYYY-MM-DD"
          placeholder={['开始日期', '结束日期']}
          {...props.config}
          value={props.value}
          onChange={props.onChange}
        />
      )
    }
  }
})
