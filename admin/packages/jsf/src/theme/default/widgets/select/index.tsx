import { computed, defineComponent, ref } from 'vue'
import { Icon, Select } from '@pkg/ui'
import './style.scss'
import { CommonWidgetPropsDefine } from '../../../../types/widget'
import { getWidgetConfig } from '../../../../utils/widget'

const isEmpty = (v: any) => v === '' || v === undefined || v === null

export default defineComponent({
  name: 'w_select',
  props: CommonWidgetPropsDefine,
  setup(props) {
    const customizable = computed(() => {
      return props.config?.customizable === true
    })

    const customValue = ref<string | null>(null)
    const onSearch = (text: string) => {
      customValue.value = text
    }

    const optionsRef = computed(() => {
      let options = getWidgetConfig(props.schema, 'options')
      options = (Array.isArray(options) ? options : []).slice(0)

      // // 外部值，单个或多个
      // if (
      //   !isEmpty(props.value) &&
      //   !options.find((item: any) => item?.label === props.value || item?.value === props.value)
      // ) {
      //   options.unshift({ label: props.value, value: props.value })
      // }

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
    return () => {
      return (
        <Select
          class="w_select"
          {...props.config}
          showSearch={customizable.value ? true : props.config?.showSearch}
          onSearch={customizable.value ? onSearch : props.config?.onSearch}
          options={optionsRef.value}
          optionFilterProp={props.config?.optionFilterProp ?? 'label'}
          placeholder={props.config?.placeholder ?? (customizable.value ? '请选择或自定义输入' : undefined)}
          value={props.value as any}
          onChange={(v) => props.onChange(v)}
          onMousedown={onMousedown}
          suffixIcon={<Icon name="down" />}
        ></Select>
      )
    }
  }
})
