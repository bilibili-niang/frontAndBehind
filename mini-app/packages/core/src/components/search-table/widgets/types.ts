import { type PropType } from 'vue'

export const commonSearchTableWidgetPropsDefine = {
  label: {
    type: String,
    required: true
  },
  config: {
    type: Object
  },
  value: {},
  onChange: {
    type: Function as PropType<(v: any) => void>,
    required: true
  }
}
