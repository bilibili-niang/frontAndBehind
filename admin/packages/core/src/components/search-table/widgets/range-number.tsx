import { InputNumber } from '@pkg/ui'
import { defineComponent } from 'vue'
import { commonSearchTableWidgetPropsDefine } from './types'
import './styles/range-number.scss'

export default defineComponent({
  name: 'fw_range-number',
  props: commonSearchTableWidgetPropsDefine,
  setup(props) {
    const onChange = (v: any, index: number) => {
      const value = Array.isArray(props.value) ? props.value : [null, null]
      value[index] = v
      props.onChange?.(value)
    }
    return () => {
      const value = Array.isArray(props.value) ? props.value : [null, null]
      return (
        <div class="btp__filter-widget fw_range-number">
          <label>{props.label}</label>
          <InputNumber
            class="fw_range-number__min"
            value={value[0]}
            onChange={(v) => onChange(v, 0)}
            controls={false}
          />
          <div>～</div>
          <InputNumber
            class="fw_range-number__max"
            value={value[1]}
            onChange={(v) => onChange(v, 1)}
            controls={false}
          />
        </div>
      )
    }
  }
})
