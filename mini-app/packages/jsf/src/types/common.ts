import { type ComponentPublicInstance, type PropType } from 'vue'
import { type ErrorSchema, type Schema } from './schema'
import type { WidgetConfig } from './widget'
import type { SchemaValidateResult } from './validate'

export declare type ComponentPublicInstanceConstructor<T extends ComponentPublicInstance> = {
  new (): T
}

export const CommonPropsDefine = {
  path: {
    type: String as PropType<string>,
    required: true
  },
  value: {
    type: undefined as unknown as PropType<any>,
    required: true
  },
  rootValue: {
    type: undefined as unknown as PropType<any>,
    required: true
  },
  schema: {
    type: [Object, String] as PropType<Schema>,
    required: true
  },
  rootSchema: {
    type: Object as PropType<Schema>,
    required: true
  },
  onChange: {
    type: Function as PropType<(value: any) => void>,
    required: true
  },
  config: {
    type: Object as PropType<WidgetConfig>
  },
  errorSchema: {
    type: Object as PropType<ErrorSchema>
  }
} as const
