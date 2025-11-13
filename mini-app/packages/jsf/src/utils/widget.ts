import { computed, inject, type Ref } from 'vue'
import type { Schema } from '../types/schema'
import type { RegisteredWidgets, WidgetComponentDefine } from '../types/widget'
import { isVueComponent } from './common'
import { useThemeContext } from '../theme'
import { getSchemaType } from './schema'
import NotFoundWidget from '../components/not-found-widget'
import type { PropsArg } from './field'

/** 获取控件定义 */
export function getWidget(schema: Schema, widget: any, registeredWidgets?: RegisteredWidgets) {
  // 1. 是 Vue 组件，直接返回组件
  if (isVueComponent(widget)) {
    return widget
  }

  // 1.1 显式支持函数式组件（避免因判断异常而回退到 NotFoundWidget）
  if (typeof widget === 'function') {
    return widget
  }

  // 2. 匹配到已注册控件，返回控件
  if (typeof widget === 'string' && registeredWidgets?.[widget]) {
    return registeredWidgets[widget]
  }

  // 3. 未能通过 widget 匹配到任何控件，使用 type 默认控件
  if (!widget) {
    const type = getSchemaType(schema)
    if (registeredWidgets?.[type]) {
      return registeredWidgets[type]
    }
  }

  // 无法确定是什么控件
  return registeredWidgets?.NotFoundWidget ?? NotFoundWidget
}

/** 获取响应式控件定义 */
export const useWidget = (
  schema: Schema,
  widget?: WidgetComponentDefine | string | any
): Ref<WidgetComponentDefine> => {
  // 可能是名称、主题
  const Component = computed(() => {
    const themeContext = useThemeContext()
    const registeredWidgets = themeContext.value.widgets
    return getWidget(schema, widget ?? schema.widget, registeredWidgets)
  })
  return Component
}

/** 获取组件配置 */
export const getWidgetConfig = (schema: Schema, key: string) => {
  return schema.config?.[key]
}

export const useInjectInlineEnable = (props: PropsArg) => {
  /** 注入内联的开关，默认 null */
  const inlineEnableWidgets = inject('inline_enable_widgets', null) as any

  const inlineEnable = computed(() => {
    const target = inlineEnableWidgets?.value?.[props.path]
    if (!target)
      return {
        widget: null,
        value: true
      }
    return {
      widget: target.widget,
      value: target.value
    }
  })
  return inlineEnable
}
