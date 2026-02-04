import { defineComponent } from 'vue'
import { CommonWidgetPropsDefine } from '../../../../types/widget'
import { Input } from '@pkg/ui'
import './style.scss'

export default defineComponent({
  name: 'w_string',
  props: CommonWidgetPropsDefine,
  setup(props) {
    const { placeholder, ...rest } = props.config
    return () => {
      return (
        <Input
          class="w_string"
          placeholder={(typeof placeholder === 'function' ? placeholder?.() : placeholder) || ''}
          {...rest}
          value={props.value}
          onChange={(e) => {
            props.onChange(e.target.value)
          }}
        ></Input>
      )
    }
  }
})
