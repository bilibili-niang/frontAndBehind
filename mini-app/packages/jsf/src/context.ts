import { inject, type Ref } from 'vue'
import { type Schema } from './types/schema'
import SchemaFormItem from './schema-form-item'

export const SCHEMA_FORM_CONTEXT = Symbol()
export const SCHEMA_FORM_SLOTS = Symbol()

export interface JSFContext {
  // errors: any[]
  formatMaps: Record<string, any>
  validate: (
    schema: Schema,
    data: any
  ) => {
    valid: boolean
    errors: any[]
  }
  pathMap: Record<string, any>
  SchemaFormItem: typeof SchemaFormItem
}

export function useJSFContext(): Ref<JSFContext> {
  const context = inject(SCHEMA_FORM_CONTEXT)
  if (!context) {
    console.error('找不到 SchemaForm Context')
    // throw new Error()
  }
  return context as Ref<JSFContext>
}
