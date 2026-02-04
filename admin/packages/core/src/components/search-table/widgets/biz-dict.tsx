import { Select } from '@pkg/ui'
import { defineComponent } from 'vue'
import './styles/select.scss'
import { commonSearchTableWidgetPropsDefine } from './types'
import { useBizDict } from '../../../hooks/useBizDict'

export default defineComponent({
  name: 'fw_biz-dict',
  props: commonSearchTableWidgetPropsDefine,
  setup(props) {
    const { options, fetchData } = useBizDict(props.config?.code)

    return () => {
      return (
        <div class="btp__filter-widget">
          <label>{props.label}</label>
          <Select
            {...props.config}
            allowClear
            value={props.value as any}
            options={options.value}
            onChange={(v: any) => {
              props.onChange?.(v)
            }}
          />
        </div>
      )
    }
  }
})
