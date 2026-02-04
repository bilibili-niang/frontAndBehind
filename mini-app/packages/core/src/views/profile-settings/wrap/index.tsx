import { Icon } from '@pkg/ui'
import { defineComponent, PropType } from 'vue'
import './style.scss'

export default defineComponent({
  props: {
    label: [String, Function, Object] as PropType<any>,
    required: Boolean
  },
  setup(props, { slots }) {
    return () => {
      return (
        <div class="form-item">
          <div class="form-item__content">
            <div class="form-item__label">
              {props.label}
              {props.required && <div class="required">*</div>}
            </div>
            <div class="form-item__value">
              {slots.default?.()}
              {/* <div class="form-item__placeholder">请填写</div> */}
            </div>
            <div class="form-item__suffix">
              <Icon name="right" />
            </div>
          </div>
          <div class="form-item__append">{slots.append?.()}</div>
        </div>
      )
    }
  }
})

export const commonProfileWidgetPropsDefine = {
  value: {
    type: [Object, Array, Number, String, Boolean, null, undefined] as PropType<any>,
    default: () => undefined
  },
  onChange: {
    type: Function as PropType<(v: any) => void>
  },
  required: Boolean
}
