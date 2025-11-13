import { InputNumber } from '@anteng/ui'
import { defineComponent } from 'vue'
import './styles/input.scss'
import { commonSearchTableWidgetPropsDefine } from './types'

export default defineComponent({
  name: 'fw_input-number',
  props: commonSearchTableWidgetPropsDefine,
  setup(props) {
    return () => {
      return (
        <div class="jsf-ui">
          <InputNumber
            {...props.config}
            class="btp__filter-widget"
            prefix={props.label}
            value={props.value as any}
            onChange={props.onChange}
          />
        </div>
      )
    }
  }
})
