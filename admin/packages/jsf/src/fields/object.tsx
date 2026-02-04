import { computed, defineComponent, provide, type PropType, inject, ref } from 'vue'
import { useCommonField, useObjectFiled } from '../utils/field'
import { commonFieldPropsDefine } from '../types/field'
import { isObject } from '../utils/common'
import type { ObjectSchema, Schema } from '../types/schema'
import { Switch } from '@pkg/ui'
import { mountWidgetRef } from '../pluginsInject'

// TODO 将这个逻辑提升到 retrieveSchema 阶段
/** 检查 enableKey 是否合法，避免与现存的子属性冲突 */
const checkEnableKeyValid = (schema: Schema, childSchema: Schema, key?: string) => {
  if (typeof key !== 'string') return false
  if (!(key.length > 0)) return false
  if ((childSchema as ObjectSchema).enableKeyAsProperty && (childSchema as ObjectSchema).properties?.[key]) return false
  if ((schema as ObjectSchema).properties?.[key]) return false
  return true
}

export default defineComponent({
  name: 'ObjectField',
  props: {
    ...commonFieldPropsDefine,
    schema: {
      type: Object as PropType<ObjectSchema>,
      required: true
    }
  },
  setup(props) {
    const { widgetRef, propsRef } = useCommonField(props)

    const onObjectChange = (value: any) => {
      props.onChange(isObject(value) ? value : {})
    }

    const { handleObjectFieldChange } = useObjectFiled(props)

    /** 提取子属性中声明了 enableKeys 的定义 */
    const inlineEnableKeys = computed(() => {
      const list: { enableKey: string; path: string; schema: Schema; key: string }[] = []
      Object.keys(props.schema.properties || {}).forEach((key) => {
        const schema = props.schema.properties![key]
        if (checkEnableKeyValid(props.schema, schema, schema.enableKey)) {
          list.push({
            enableKey: schema.enableKey as string,
            path: `${props.path}.${key}`,
            schema,
            key
          })
        }
      })
      return list
    })

    const extendsInlineEnableWidgets = inject('inline_enable_widgets', ref({}))

    /** 生成内联 enable 控件 */
    const inlineEnableWidgets = computed(() => {
      const widgets: Record<string, any> = { ...extendsInlineEnableWidgets.value }

      const list = inlineEnableKeys.value

      list.forEach((item) => {
        if (item.schema.type === 'object' && item.schema.enableKeyAsProperty) {
          let value = props.value?.[item.key]?.[item.enableKey] ?? false

          if (item.schema.enableValueAsNumber) {
            value = value === 1 ? true : false
          }

          widgets[item.path] = {
            value,
            widget: (
              <Switch
                checked={value}
                onChange={(v: any) => {
                  let value = props.value?.[item.key]
                  value = isObject(value) ? value : {}
                  value[item.enableKey] = item.schema.enableValueAsNumber ? (v ? 1 : 0) : v
                  handleObjectFieldChange(item.key, value)
                }}
              ></Switch>
            )
          }
        } else {
          let value = props.value?.[item.enableKey] ?? false
          if (item.schema.enableValueAsNumber) {
            value = value === 1 ? true : false
          }
          widgets[item.path] = {
            value,
            widget: (
              <Switch
                checked={value}
                onChange={(v) => {
                  const _v = item.schema.enableValueAsNumber ? (v ? 1 : 0) : v
                  handleObjectFieldChange(item.enableKey, _v)
                }}
              ></Switch>
            )
          }
        }
      })
      return widgets
    })

    // 向下注入 enable 控件，这里是响应式 ComputedRef 数据
    provide('inline_enable_widgets', inlineEnableWidgets)

    const schemaRef = computed(() => {
      return {
        ...props.schema,
        // 这里过滤掉内联处理的属性
        properties: props.schema.properties
      }
    })

    return () => {
      const Widget = widgetRef.value
      return (
        <Widget
          {...propsRef.value}
          {...mountWidgetRef(propsRef.value)}
          schema={schemaRef.value}
          onChange={onObjectChange}
        ></Widget>
      )
    }
  }
})
