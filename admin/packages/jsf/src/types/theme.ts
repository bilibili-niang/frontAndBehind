import type { Schema } from './schema'
import type { RegisteredWidgets } from './widget'

export interface Theme {
  /** 主题名称 */
  name: string
  /** 控件 */
  widgets: RegisteredWidgets

  /** 预设Schema */
  presetSchema?: Record<string, Schema>

  /** 纯控件，不渲染 label 等内容，完全自由定制控件内容 */
  pureWidgets?: string[]
}
