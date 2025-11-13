// 表单 Schema 类型定义
export interface Schema {
  type?: string
  title?: string
  description?: string
  properties?: Record<string, Schema>
  items?: Schema | Schema[]
  required?: string[]
  [key: string]: any
}

export type CommonStatus = 0 | 1

export interface UseCrudOptions<T = any> {
  title: string
  width?: number
  createTitle?: string
  updateTitle?: string
  removeTitle?: string
  schema: Schema | ((type: 'create' | 'update') => Schema)
  value?: any
  onChange?: (value: any) => void
  defaultValue?: () => T
  format?: (value: T) => T
  retrieve?: (value: any) => T
  onCreate?: (value: T) => void | Promise<any>
  onCreateSuccess?: (value: T) => void
  onUpdate?: (value: T) => void | Promise<any>
  onUpdateSuccess?: (value: T) => void
  onToggleStatus?: (status: CommonStatus) => void | Promise<any>
  onToggleSuccess?: (status: CommonStatus) => void
  onRemove?: () => Promise<any>
  onRemoveSuccess?: (value: any) => void
  fullScreen?: boolean
}
