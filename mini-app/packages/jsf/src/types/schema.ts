import { type DefineComponent, type SetupContext } from 'vue'
import { CommonWidgetPropsDefine } from './widget'
import type { SchemaValidateResult, SchemaValidator } from './validate'

type Temp = DefineComponent<typeof CommonWidgetPropsDefine>
export type FunctionalWidgetProps = Omit<InstanceType<Temp>['$props'], 'class' | 'style'>

/** 函数式控件实现 */
export type FunctionalWidget = (props: FunctionalWidgetProps, context: SetupContext) => any

/** Schema 基础类型，null 无实际意义可配合 widget 充当插槽使用 */
export type SchemaTypes = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null'

export type CommonSchema = {
  /** 标题/名称 */
  title?: string

  /** 字段描述 */
  description?: string | DefineComponent | FunctionalWidget | JSX.Element

  /** 控件 */
  widget?: string | DefineComponent<typeof CommonWidgetPropsDefine, any, any> | FunctionalWidget

  /** 默认值 */
  default?: any

  /** 必须 */
  required?: boolean

  /** 数据校验，onChange 时触发 */
  validator?: SchemaValidator | SchemaValidator[]

  /** 是否隐藏，默认 false */
  hidden?: boolean

  /** 是否禁用字段，内嵌套的字段也将一同被禁用，默认 false */
  disabled?: boolean | ((rootValue: any, parentalValue: any, parentalProps: FunctionalWidgetProps) => boolean)

  /** 显示条件 */
  condition?: boolean | ((rootValue: any, parentalValue: any, parentalProps: FunctionalWidgetProps) => boolean)

  /** 是否只读（与disabled交互、样式不一样），内嵌套的字段也将一同只读，默认 false */
  readonly?: boolean

  /** 纯净无包裹，不限于 label 等 */
  pure?: boolean

  /** 开启 switch 内联，pure 控件需要自行支持注入插槽 */
  enableKey?: string

  /** switch 使用 0 、1 控制 */
  enableValueAsNumber?: boolean

  /** 字段组件类名，默认设置 在 form-item 节点，若 pure 属性为 true 则设置在 widget 节点上 */
  className?: string

  /** 在明确了一些字段没有 enable 开关时，可以将缩进省略，防止文字过长显示换行 */
  noIndent?: boolean

  /** 控件配置 */
  config?: {
    [key: string]: any
  }
}
export type ObjectSchema = {
  type: 'object'
  /** 子属性 */
  properties?: {
    [key: string]: Schema
  }
  /** 仅 object 类型有效，enableKey 是否作为子属性 (默认：false 为同级属性) */
  enableKeyAsProperty?: boolean
} & CommonSchema

export type ArraySchema = {
  type: 'array'
  /** 数组子项 | 枚举子项 */
  items?: Schema | Schema[]
} & CommonSchema

/** Schema 定义 */
export type Schema =
  | ObjectSchema
  | ArraySchema
  | ({
      type: Exclude<SchemaTypes, 'object' | 'array'>
    } & CommonSchema)

export type ErrorSchema = {
  valid: boolean
  errorMap: Record<string, SchemaValidateResult>
}
