import './index.scss'
import { defineComponent } from "vue"
import { Input as AntInput } from "ant-design-vue"

export default defineComponent({
  name: 'UiInput',
  props: {
    modelValue: { type: [String, Number], default: '' },
    placeholder: { type: String, default: undefined },
    label: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
    allowClear: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit, attrs }) {
    const onUpdate = (val: string) => emit('update:modelValue', val)
    const ph = props.placeholder ?? props.label
    const className = attrs?.class as any
    return () => (
      <AntInput
        value={props.modelValue as any}
        onUpdate:value={onUpdate}
        placeholder={ph}
        disabled={props.disabled}
        allowClear={props.allowClear}
        class={className}
        {...attrs}
      />
    )
  },
})
