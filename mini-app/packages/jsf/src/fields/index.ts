import { defineComponent, type PropType } from 'vue'
import { type Schema } from '../types/schema'
import StringField from './string'
import NumberField from './number'
import BooleanField from './boolean'
import ObjectField from './object'
import ArrayField from './array'
import NullField from './null'
import UnsupportedField from './unsupported'
import { commonFieldPropsDefine } from '../types/field'

const Filed = defineComponent({
  props: {
    ...commonFieldPropsDefine,
    onContextmenu: {
      type: Function as PropType<(e: MouseEvent) => void>
    }
  },
  attrs: {
    /** 使非表单元素可触发focus、blur事件 */
    // tabIndex: {},
    // onFocus: {
    //   type: Function as PropType<(e: FocusEvent) => void>
    // },
    // onBlur: {
    //   type: Function as PropType<(e: FocusEvent) => void>
    // }
    onContextmenu: {
      type: Function as PropType<(e: MouseEvent) => void>
    }
  }
})

/** 字段组件 */
type FieldComponent = typeof Filed

/** 获取字段类型 */
export function getSchemaFiled(schema: Schema): FieldComponent {
  const { type } = schema
  if (type) {
    switch (type) {
      case 'string':
        return StringField as FieldComponent
      case 'number':
        return NumberField as FieldComponent
      case 'boolean':
        return BooleanField as FieldComponent
      case 'object':
        return ObjectField as FieldComponent
      case 'array':
        return ArrayField as FieldComponent
      case 'null':
        return NullField as any
      default: {
        // 类型定义错误，非JSON Schema 支持的基本数据类型
        return UnsupportedField as never
      }
    }
  }
  // 不符合以上情况，则不支持
  return UnsupportedField as FieldComponent
}
