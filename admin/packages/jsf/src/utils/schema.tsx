import { defaultsDeep } from 'lodash'
import { useThemeContext } from '../theme'
import type { ArraySchema, Schema, SchemaTypes } from '../types/schema'
import { Alert } from '@pkg/ui'

/** 定义 Schema 辅助函数 */
export const defineSchema = (schema: Schema) => schema

/** 恢复 Schema 反序列化 */
export const retrieveSchema = (schema: Schema | string) => {
  if (typeof schema === 'string') {
    // 预设名称，从主题上下文里获取已注册的预设
    const themeContext = useThemeContext()
    return (themeContext.value.presetSchema?.[schema] ?? {
      type: 'null',
      widget: () => (
        <Alert
          class="ui-scrollbar--hidden"
          style="height:100%;width:100%;padding:4px 8px;"
          message={
            <div style="display:flex;flex-direction:column;">
              <small>找不到预设 "{schema}"</small>
            </div>
          }
          type="error"
          show-icon
        />
      )
    }) as Schema
  }
  return schema
}

/**
 * 获取schema数据类型
 * @param schema
 * @returns {string} string | number | boolean | object | array | null | 未定义
 */
export function getSchemaType(schema: Schema) {
  const { type } = schema
  return type as SchemaTypes
}

/** 根据 Schema 生成默认数据 */
export const generateDefaultValue = (schema: Schema, fully?: boolean): any => {
  if (Object.prototype.hasOwnProperty.call(schema, 'type')) {
    if (schema.type === 'object') {
      const obj = {} as Record<string, any>
      if (Object.prototype.hasOwnProperty.call(schema, 'properties')) {
        Object.keys(schema.properties!).forEach((key) => {
          const value = generateDefaultValue(schema.properties![key], fully)
          if (value !== undefined) {
            obj[key] = value
          }
        })
      }
      return defaultsDeep(obj, schema.default)
    } else if (schema.type === 'array') {
      let value: any[] = []
      if (Object.prototype.hasOwnProperty.call(schema, 'items')) {
        const items = (schema as ArraySchema).items
        if (Array.isArray(items)) {
          // 枚举的每个子项不能缺失，默认 undefined
          value = items.map((item) => generateDefaultValue(item, fully))
        } else {
          value = [generateDefaultValue(items!, fully)]
        }
      }
      return ([] as any[]).concat(value.filter((item) => item !== undefined))
    } else {
      if (Object.prototype.hasOwnProperty.call(schema, 'default')) {
        return schema.default
      } else if (fully) {
        if (schema.type === 'string') {
          return ''
        } else if (schema.type === 'number') {
          return 0
        } else if (schema.type === 'boolean') {
          return false
        }
      }
    }
  }

  return schema.default // undefined
}
