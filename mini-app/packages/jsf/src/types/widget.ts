import type { ComponentPublicInstance, ExtractPropTypes } from 'vue'
import { CommonPropsDefine, type ComponentPublicInstanceConstructor } from './common'

export type WidgetComponentType = ComponentPublicInstance<ExtractPropTypes<typeof CommonWidgetPropsDefine>>

export type WidgetComponentDefine = ComponentPublicInstanceConstructor<WidgetComponentType>

export interface WidgetConfig {
  [key: string]: any
}

/** attrs */
export const NoPropsDefine = {
  title: {},
  class: {},
  style: {},
  pure: {}
}

export const CommonWidgetPropsDefine = {
  ...NoPropsDefine,
  ...CommonPropsDefine
} as const

/** 已注册控件 */
export type RegisteredWidgets = {
  [k: string]: WidgetComponentDefine
} & {
  NotFoundWidget?: WidgetComponentDefine
}
