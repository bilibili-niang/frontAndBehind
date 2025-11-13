import { defineComponent, ref } from 'vue'
import './styles/cascader.scss'
import { commonSearchTableWidgetPropsDefine } from './types'
import { Cascader } from '@anteng/ui'

export default defineComponent({
  name: 'fw_cascader',
  props: commonSearchTableWidgetPropsDefine,
  setup(props) {
    const isFocus = ref(false)

    return () => {
      return (
        <div class={['btp__filter-widget', isFocus.value && '--focus']}>
          <label>{props.label}</label>
          <Cascader
            class="btp__filter-widget"
            {...props.config}
            onFocus={() => {
              isFocus.value = true
            }}
            onBlur={() => {
              isFocus.value = false
            }}
            value={props.value as any}
            onChange={(e: any) => props.onChange?.(e)}
          />
        </div>
      )
    }
  }
})
