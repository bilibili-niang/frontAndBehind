import { Select } from '@anteng/ui'
import { computed, defineComponent, ref } from 'vue'
import './styles/select.scss'
import { commonSearchTableWidgetPropsDefine } from './types'

const isEmpty = (v: any) => v === '' || v === undefined || v === null

export default defineComponent({
  name: 'fw_select',
  props: commonSearchTableWidgetPropsDefine,
  setup(props) {
    const customizable = computed(() => {
      return props.config?.customizable === true
    })

    const customValue = ref<string | null>(null)
    const onSearch = (text: string) => {
      customValue.value = text
    }

    const optionsRef = computed(() => {
      let options = props.config?.options ?? []
      options = (Array.isArray(options) ? options : []).slice(0)

      // 自定义值
      if (
        customizable.value &&
        !isEmpty(customValue.value) &&
        !options.find((item: any) => item?.label === customValue.value || item?.value === customValue.value)
      ) {
        options.unshift({ label: customValue.value, value: customValue.value })
      }

      return options
    })

    const onMousedown = (e: MouseEvent) => {
      props.config?.onMousedown?.(e)
      customValue.value = null
    }

    const isFocus = ref(false)

    return () => {
      return (
        <div class="btp__filter-widget">
          <label>{props.label}</label>
          <Select
            {...props.config}
            allowClear={true}
            showSearch={customizable.value ? true : props.config?.showSearch}
            onSearch={customizable.value ? onSearch : props.config?.onSearch}
            options={optionsRef.value}
            optionFilterProp={props.config?.optionFilterProp ?? 'label'}
            placeholder={
              props.config?.placeholder ?? (customizable.value && isFocus.value ? '请选择或自定义输入' : undefined)
            }
            value={props.value as any}
            onChange={(v) => props.onChange?.(v)}
            onMousedown={onMousedown}
            onFocus={() => {
              isFocus.value = true
            }}
            onBlur={() => {
              isFocus.value = false
            }}
          ></Select>
        </div>
      )
    }
  }
})
