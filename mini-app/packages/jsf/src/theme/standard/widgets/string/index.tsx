import { defineComponent } from 'vue'
import { CommonWidgetPropsDefine } from '../../../../types/widget'
import { Input } from '@anteng/ui'
import './style.scss'

export default defineComponent({
  name: 'sw_string',
  props: CommonWidgetPropsDefine,
  setup(props) {
    return () => {
      return (
        <Input
          class="sw_string"
          {...props.config}
          value={props.value}
          onChange={(e) => {
            props.onChange(e.target.value)
          }}
        ></Input>
      )
    }
  }
})
