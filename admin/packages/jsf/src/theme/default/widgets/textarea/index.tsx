import { defineComponent } from 'vue'
import { CommonWidgetPropsDefine } from '../../../../types/widget'
import { Textarea } from '@pkg/ui'
import './style.scss'

export default defineComponent({
  name: 'w_textarea',
  props: CommonWidgetPropsDefine,
  setup(props) {
    return () => {
      return (
        <Textarea
          class="w_textarea"
          {...props.config}
          value={props.value}
          autoSize={{ minRows: 2, maxRows: 10 }}
          onChange={(e: any) => {
            props.onChange(e.target.value)
          }}
        ></Textarea>
      )
    }
  }
})
