import { computed, defineComponent, type PropType, provide, ref, toRaw, watch } from 'vue'
import SchemaFormItem from './schema-form-item'
import { CommonPropsDefine } from './types/common'
import { SCHEMA_FORM_THEME } from './theme'
import './style.scss'
import type { Theme } from './types/theme'
import { defaultsDeep } from 'lodash'
import { message, Modal, Textarea } from '@pkg/ui'
import { useContextMenu, uuid } from '@pkg/core'

const { rootSchema, rootValue, path, ...schemaFormPropsDefine } = CommonPropsDefine

export default defineComponent({
  name: 'SchemaForm',
  props: {
    ...schemaFormPropsDefine,
    theme: {
      type: [String, Object] as PropType<'standard' | 'compact' | (string & {}) | Theme>,
      default: 'standard'
    },
    readonly: {
      type: Boolean
    },
    id: {}
  },
  setup(props) {
    // 向下注入 SchemaFormItem，避免编译时循环引用
    provide('schema-form-item', SchemaFormItem)

    // 注入主题名称
    provide(
      SCHEMA_FORM_THEME,
      computed(() => props.theme)
    )

    const formKey = ref(uuid())

    watch(
      () => props.schema,
      (schema) => {
        // 初始化时 schema 可能为 undefined，防护避免报错
        if (!schema) return
        const currentValue = props.value
        defaultsDeep(currentValue, schema.default)
      },
      { immediate: true }
    )

    const onContextmenu = (e: MouseEvent) => {
      const items = [
        {
          type: 'item',
          label: '复制值',
          onClick: () => {
            const raw = toRaw(props.value)
            const content = JSON.stringify(raw, null, 2)
            Modal.open({
              title: '复制表单值',
              content: () => <Textarea readonly value={content}/>,
              footer: () => null
            })
          }
        },
        {
          type: 'item',
          label: '清空',
          onClick: () => {
            Object.keys(props.value || {}).forEach((key) => {
              delete props.value[key]
            })
            message.success('已清空')
            formKey.value = uuid()
          }
        }
      ]
      useContextMenu(e, items)
    }

    return () => {
      if (props.schema.type !== 'object') return <div class="color-error">RootSchema 必须是 object 类型</div>
      return (
        <div
          class={[
            'jsf_form ui-scrollbar',
            typeof props.theme === 'string' && `jsf_form--${props.theme}`,
            props.readonly && 'jsf_form--readonly'
          ]}
          onContextmenu={onContextmenu}
          key={formKey.value}
        >
          <div
            class="jsf_form-content"
          >
            <SchemaFormItem
              {...props}
              path="$"
              rootSchema={props.schema}
              rootValue={props.value}
              errorSchema={props.errorSchema}
            />
          </div>
        </div>
      )
    }
  }
})
