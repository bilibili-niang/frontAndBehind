import { Input } from '@pkg/ui'
import { defineComponent } from 'vue'
import './styles/input.scss'
import { commonSearchTableWidgetPropsDefine } from './types'

export default defineComponent({
  name: 'fw_input',
  props: commonSearchTableWidgetPropsDefine,
  setup(props) {
    return () => {
      return (
        <div class="jsf-ui">
          <Input
            class="btp__filter-widget"
            {...props.config}
            type="text"
            prefix={props.label}
            value={props.value as any}
            onChange={(e: any) => props.onChange?.(e.target.value)}
          />
        </div>
      )
    }
  }
})
