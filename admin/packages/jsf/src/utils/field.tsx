import { computed, inject, type ExtractPropTypes } from 'vue'
import type { ArraySchema, ObjectSchema } from '../types/schema'
import type { commonFieldPropsDefine } from '../types/field'
import { useWidget } from './widget'
import { isObject, orderProperties } from './common'
import schemaFormItem from '../schema-form-item'
import { cloneDeep } from 'lodash'
import { message } from '@pkg/ui'
import { retrieveSchema } from './schema'

export type PropsArg = ExtractPropTypes<typeof commonFieldPropsDefine>

export const useCommonField = (props: PropsArg) => {
  /** 渲染控件 */
  const widgetRef = computed(() => {
    const { schema } = props
    const widget = useWidget(schema)
    if (typeof schema.widget === 'function') {
      return ((...args: any) => {
        try {
          // 添加 fragment 包裹，防止 attrs 透传
          return <>{(widget.value as any)?.(...args)}</>
        } catch (err) {
          return widget.value
        }
      }) as unknown as typeof widget.value
    }
    return widget.value
  })

  const propsRef = computed(() => {
    return {
      title: props.schema.title,
      description: props.schema.description,
      value: props.value,
      rootValue: props.rootValue,
      schema: props.schema,
      rootSchema: props.rootSchema,
      path: props.path,
      // TODO 这里要对 () => boolean 兼容处理
      // disabled: props.schema.disabled,
      readonly: props.schema.readonly,
      hidden: props.schema.hidden,
      config: props.schema.config ?? {},
      errorSchema: props.errorSchema
    }
  })

  return {
    widgetRef,
    propsRef
  }
}

/** 获取 Object 属性列表 */
export const getObjectOrderedPropetiesRef = (props: PropsArg) => {
  return computed(() => {
    const schema = props.schema as ObjectSchema
    const config = schema.config ?? {}
    const properties = Object.keys(schema.properties || {})
    const propertiesOrders = Array.isArray(config.orders) ? config.orders : []

    return orderProperties(properties, propertiesOrders).filter((key) => {
      const item = schema.properties![key]

      // 显示条件
      try {
        if (typeof item.condition === 'boolean') {
          return item.condition
        }

        if (item.condition && !item.condition(props.rootValue, props.value, props)) {
          return false
        }
      } catch (err) {
        console.error('[Schema.condition]：', err)
        return false
      }

      // 隐藏
      if (item.hidden == true) {
        return false
      }

      // TODO 这里要判断属性联动，决定是否显示该字段

      return true
    })
    // .filter()
    // TODO 如果 enable 属性 为 boolean 类型，默认过滤掉，在 label 前显示 switch 控件
  })
}

export const useObjectFiled = (props: PropsArg & { config: any }) => {
  // 运行时注入 SchemaFormItem，避免导致循环引用问题
  const SchemaFormItem = inject('schema-form-item') as typeof schemaFormItem

  // 属性列表（经过排序、过滤）
  const propertiesRef = getObjectOrderedPropetiesRef(props)

  const CommonObjectFieldContent = computed(() => {
    const schema = props.schema as ObjectSchema
    const currentValue = isObject(props.value) ? props.value : {}
    return propertiesRef.value.map((key) => {
      const s = retrieveSchema(schema.properties![key])
      return (
        <SchemaFormItem
          key={`${props.path}.${key}`}
          path={`${props.path}.${key}`}
          rootSchema={props.rootSchema}
          rootValue={props.rootValue}
          schema={s}
          value={currentValue[key]}
          errorSchema={props.errorSchema}
          onChange={(value) => {
            handleObjectFieldChange(key, value)
          }}
        />
      )
    })
  })

  // 处理子属性变更
  const handleObjectFieldChange = (key: string, value: any) => {
    const currentValue = isObject(props.value) ? props.value : {}
    if (value === undefined) {
      delete currentValue[key]
    } else {
      currentValue[key] = value
    }
    props.onChange(currentValue)
  }
  return {
    SchemaFormItem,
    CommonObjectFieldContent,
    propertiesRef,
    handleObjectFieldChange
  }
}

export const useArrayField = (props: PropsArg & { config: any }) => {
  // 运行时注入 SchemaFormItem，避免导致循环引用问题
  const SchemaFormItem = inject('schema-form-item') as typeof schemaFormItem

  const isTuple = computed(() => Array.isArray((props.schema as ArraySchema).items))

  /** 默认内容，可以自定义其他内容 */
  const CommonArrayFieldContent = computed(() => {
    const currentValue = Array.isArray(props.value) ? props.value : []
    const schema = (props.schema as ArraySchema).items!
    return currentValue.map((item, index) => {
      const s = Array.isArray(schema) ? schema[index] : schema
      return (
        <SchemaFormItem
          key={`${props.path}.${index}`}
          path={`${props.path}[${index}]`}
          title={`${s.title} ${index + 1}`}
          rootSchema={props.rootSchema}
          rootValue={props.rootValue}
          schema={s}
          value={item}
          errorSchema={props.errorSchema}
          onChange={(value) => {
            onArrayItemChange(index, value)
          }}
        />
      )
    })
  })

  const onChange = (value: any) => {
    const currentValue = Array.isArray(value ?? props.value) ? value ?? props.value : []
    props.onChange(currentValue)
  }

  const defaultItemValue = () => {
    const d = props.config?.itemDefault ?? null
    return cloneDeep(d)
  }

  const onArrayItemChange = (index: number, value: any) => {
    const currentValue = Array.isArray(props.value) ? props.value : []
    currentValue[index] = value
    onChange(currentValue)
  }

  /** 新增子项 */
  const onAdd = () => {
    const maxLength = props.config?.maxLength ?? props.config?.max ?? -1
    const currentValue = Array.isArray(props.value) ? props.value : []
    if (maxLength > -1 && currentValue.length >= maxLength) {
      // 最多可添加
      message.info(`最多可添加 ${maxLength} 项`)
      return void 0
    }
    currentValue.push(defaultItemValue())
    onChange(currentValue)
    return currentValue.length - 1
  }

  /** 移除子项 */
  const onRemove = (index: number) => {
    if (!(index >= 0)) {
      return void 0
    }
    const currentValue = Array.isArray(props.value) ? props.value : []
    currentValue.splice(index, 1)
    onChange(currentValue)
  }

  /** 复制子项 */
  const onCopy = (index: number) => {
    if (!(index >= 0)) {
      return void 0
    }

    const maxLength = props.config?.maxLength ?? props.config?.max ?? -1
    const currentValue = Array.isArray(props.value) ? props.value : []
    if (maxLength > -1 && currentValue.length >= maxLength) {
      // 最多可添加
      message.info(`最多可添加 ${maxLength} 项`)
      return void 0
    }

    currentValue.push(cloneDeep(currentValue[index]))
    onChange(currentValue)
    return currentValue.length - 1
  }

  /** 子项排序上移, 返回新的下标 */
  const onUp = (index: number) => {
    const currentValue = Array.isArray(props.value) ? props.value : []
    const target = currentValue.splice(index, 1)[0]
    const targetIndex = index - 1 < 0 ? 0 : index - 1
    currentValue.splice(targetIndex, 0, target)
    onChange(currentValue)
    return targetIndex
  }

  /** 子项排序下移, 返回新的下标 */
  const onDown = (index: number) => {
    const currentValue = Array.isArray(props.value) ? props.value : []
    const target = currentValue.splice(index, 1)[0]
    const targetIndex = index + 1 > currentValue.length ? index : index + 1
    currentValue.splice(targetIndex, 0, target)
    onChange(currentValue)
    return targetIndex
  }
  return {
    SchemaFormItem,
    isTuple,
    CommonArrayFieldContent,
    onArrayItemChange,
    onAdd,
    onCopy,
    onRemove,
    onUp,
    onDown
  }
}
