import { computed, defineComponent, inject, watch } from 'vue'
import { CommonPropsDefine } from './types/common'
import { getSchemaFiled } from './fields'
import { useThemeContext } from './theme'
import { retrieveSchema } from './utils/schema'
import { useValidate } from './utils/validate'
import { message, Popover } from '@anteng/ui'
import { BUILT_IN_THEME_COMPACT, BUILT_IN_THEME_STANDARD } from './constants'
import { isVueComponent } from './utils/common'

export default defineComponent({
  name: 'SchemaFormItem',
  props: {
    ...CommonPropsDefine,
    title: {
      type: String
    },
    pure: {
      type: Boolean
    }
  },
  setup(props) {
    // TODO 这里可以处理特殊定义，例如：预设schema
    const schemaRef = computed(() => retrieveSchema(props.schema))
    const FormItemField = computed(() => getSchemaFiled(schemaRef.value))

    const themeContext = useThemeContext()

    /** 是否纯控件 */
    const isPureWidget = computed(() => {
      // Schema 中显式声明为纯控件
      if (props.pure || schemaRef.value.pure) {
        return true
      }
      // 主题中声明为纯控件
      const widget = schemaRef.value.widget ?? schemaRef.value.type
      return typeof widget === 'string' && themeContext.value.pureWidgets?.includes(widget)
    })

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

    /** 禁用 */
    const isDisabled = computed(() => {
      try {
        if (typeof props.schema.disabled === 'function') {
          return props.schema.disabled(props.rootValue, props.value, props)
        }
        return props.schema.disabled || !inlineEnable.value.value
      } catch (err) {
        console.error(err)
        return false
      }
    })

    const isReadonly = computed(() => {
      return props.schema.readonly === true
    })

    const { validate, resultRef } = useValidate(props)

    const onFormItemChange = (value: any) => {
      if (isReadonly.value) {
        message.info('该字段为“只读”，不可修改')
        return void 0
      }
      if (isDisabled.value) {
        message.info('该字段被“禁用”，不可修改')
        return void 0
      }
      props.onChange(value)
    }

    watch(
      () => props.value,
      () => {
        validate(props.value)
      },
      {
        deep: schemaRef.value.type === 'array' || schemaRef.value.type === 'object'
      }
    )

    const onLabelContextmenu = (e: MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      console.log(props.path, props.rootValue)
    }

    /** 规范化 description 渲染，支持 string / JSX / 组件 / 函数式组件 */
    const descVNodeRef = computed(() => {
      const desc = schemaRef.value.description as any
      if (!desc) return null
      // 纯文本
      if (typeof desc === 'string') return desc
      // Vue 组件定义
      if (isVueComponent(desc)) {
        const Comp = desc as any
        return (
          <Comp
            title={schemaRef.value.title}
            description={schemaRef.value.description}
            value={props.value}
            rootValue={props.rootValue}
            schema={schemaRef.value}
            rootSchema={props.rootSchema}
            path={props.path}
            readonly={props.schema.readonly}
            hidden={props.schema.hidden}
            config={props.schema.config ?? {}}
            errorSchema={props.errorSchema}
          />
        )
      }
      // 函数式组件
      if (typeof desc === 'function') {
        try {
          const ctx: any = {}
          const propsArg = {
            title: schemaRef.value.title,
            description: schemaRef.value.description,
            value: props.value,
            rootValue: props.rootValue,
            schema: schemaRef.value,
            rootSchema: props.rootSchema,
            path: props.path,
            readonly: props.schema.readonly,
            hidden: props.schema.hidden,
            config: props.schema.config ?? {},
            errorSchema: props.errorSchema
          }
          return <>{(desc as any)(propsArg, ctx)}</>
        } catch (err) {
          // 兜底直接返回
          return desc
        }
      }
      // JSX.Element 或其他可渲染节点
      return desc
    })

    return () => {
      const { onChange, ...extendProps } = props
      const hasError = !resultRef.value.valid && resultRef.value?.errors.length > 0
      const hasWarn = resultRef.value.valid && resultRef.value?.errors.length > 0
      const Filed = <FormItemField.value {...extendProps} onChange={onFormItemChange} />
      const themeName = themeContext.value.name
      if (isPureWidget.value)
        return (
          <div
            class={[
              'jsf_form-item--pure',
              isDisabled.value && 'disabled',
              hasError && 'error',
              hasWarn && 'warn',
              props.schema.required && 'required',
              isReadonly.value && 'readonly cursor-disabled'
            ]}
            title={isReadonly.value ? '该字段为 “只读”' : undefined}
          >
            {Filed}
            {(hasError || hasWarn) && (
              <div class="jsf-form-item__exceptions">
                {resultRef.value?.errors.map((error) => (
                  <div class={`jsf-form-item__${error.status}`}>{error.message}</div>
                ))}
              </div>
            )}
          </div>
        )
      return (
        <div
          class={[
            'jsf_form-item',
            isDisabled.value && 'disabled',
            hasError && 'error',
            hasWarn && 'warn',
            props.schema.required && 'required',
            isReadonly.value && 'readonly cursor-disabled'
          ]}
          title={isReadonly.value ? '该字段为 “只读”' : undefined}
          data-jsf-path={props.path}
        >
          {inlineEnable.value?.widget || !props.schema.noIndent ? (
            <div class="jsf_form-item__prefix">{inlineEnable.value?.widget}</div>
          ) : (
            <div class="jsf_form-item__prefix small"></div>
          )}
          <div
            class={[
              'jsf_form-item__label',
              props.schema.required && 'required',
              props.schema.description && themeName === BUILT_IN_THEME_COMPACT && 'jsf_form-item__label--underline'
            ]}
            onContextmenu={onLabelContextmenu}
          >
            {schemaRef.value.description && themeName === BUILT_IN_THEME_COMPACT ? (
              <Popover
                placement="bottomRight"
                content={<div class="jsf_form-item__helper-popover">{descVNodeRef.value}</div>}
              >
                {props.title ?? props.schema.title}
              </Popover>
            ) : (
              props.title ?? props.schema.title
            )}
          </div>
          <div class="jsf_form-item__widget">
            {schemaRef.value.description && themeName === BUILT_IN_THEME_STANDARD && (
              <div class="jsf_form-item__desc">{descVNodeRef.value}</div>
            )}
            <div>{Filed}</div>
            {(hasError || hasWarn) && (
              <div class="jsf-form-item__exceptions">
                {resultRef.value?.errors.map((error) => (
                  <div class={`jsf-form-item__${error.status}`}>{error.message}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    }
  }
})
