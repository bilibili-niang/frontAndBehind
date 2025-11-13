import { cloneDeep, merge } from 'lodash'
import { registerTheme, registerWidget, themeContexts } from './src/theme'
import type { Schema } from './src/types/schema'

export { default as SchemaForm } from './src/schema-form'
export { default as Cities } from './src/theme/default/widgets/cities'
export type { citiesRefType } from './src/theme/default/widgets/cities'

export { default as SchemaFormItem } from './src/schema-form-item'

export type { Schema, ErrorSchema, ArraySchema, ObjectSchema } from './src/types/schema'

export { validateForm } from './src/utils/validate'

export { CommonWidgetPropsDefine } from './src/types/widget'

const JSF = {
  registerTheme,
  registerWidget,
  themeContexts
}

export { JSF }
export default JSF

export { default as PRESET_SCHEMA } from './src/presets'

/** 获取预设Schema定义 */
export const getPresetFieldSchema = (preset: Schema, overrideSchame: any) => {
  return merge(cloneDeep(preset), overrideSchame)
}

/** 获取预设Schema默认值 */
export const getPresetFieldDefault = (preset: Schema, overrideValue?: any) => {
  return merge(cloneDeep(preset.default), overrideValue)
}

export const WidgetPropsDefaults = () => {
  return {
    rootSchema: {} as Schema,
    schema: {} as Schema,
    path: '',
    rootValue: {} as any,
    value: {} as any,
    onChange: (() => {
    }) as any
  }
}

export {
  default as
    ActionWidget
} from './src/theme/standard/widgets/action'