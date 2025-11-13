import { defineComponent, computed, type PropType } from 'vue'
import './style.scss'
import { clamp } from 'lodash'
import { CommonWidgetPropsDefine } from '../../../../types/widget'
import { getObjectOrderedPropetiesRef, useObjectFiled } from '../../../../utils/field'
import type { ObjectSchema } from '../../../../types/schema'
import { getWidgetConfig } from '../../../../utils/widget'
import { Tooltip } from '@anteng/ui'
import { isObject } from '../../../../utils/common'

export const SuiteWidget = defineComponent({
  name: 'Suite',
  props: {
    list: {
      type: Array as PropType<
        {
          key: string
          title?: string
          flex?: number
          description?: string
          hiddenTitle?: boolean
          comp: any
        }[]
      >,
      required: true
    }
  },
  setup(props) {
    return () => {
      return (
        <div class="w_suite jsf_form-item__widget">
          {props.list?.map((item: any, index: number) => {
            const { key, title, flex, description, hiddenTitle = false, comp } = item
            const flexValue = clamp(flex || 24, 1, 24)
            return (
              <div key={key} class={[`w_suite-item jsf-ui-grid-col-${flexValue}`]}>
                {comp}

                {!item.hiddenTitle &&
                  (item.description ? (
                    <Tooltip title={description}>
                      <small class="w_suite-item__label --help">{title || key}</small>
                    </Tooltip>
                  ) : (
                    <small class="w_suite-item__label">{title || key}</small>
                  ))}
              </div>
            )
          })}
        </div>
      )
    }
  }
})

export default defineComponent({
  name: 'Widget__Suite',
  props: CommonWidgetPropsDefine,
  setup(props, { slots }) {
    const { SchemaFormItem, handleObjectFieldChange } = useObjectFiled(props)

    const propertiesRef = computed(() => {
      const schema = props.schema as ObjectSchema
      const list = getObjectOrderedPropetiesRef(props).value
      const currentValue = isObject(props.value) ? props.value : {}
      return list.map((key) => {
        const itemSchma = schema.properties![key]
        return {
          key,
          title: itemSchma.title,
          flex: clamp(getWidgetConfig(itemSchma, 'flex') || 24, 1, 24),
          description: itemSchma.description,
          // 套组内嵌套组，不显示下级套组的标题
          isSuite: itemSchma.widget === 'suite',
          comp: (
            <SchemaFormItem
              key={`${props.path}.${key}`}
              path={`${props.path}.${key}`}
              rootSchema={props.rootSchema}
              rootValue={props.rootValue}
              schema={itemSchma}
              value={currentValue[key]}
              errorSchema={props.errorSchema}
              onChange={(value) => {
                handleObjectFieldChange(key, value)
              }}
              pure={true}
            />
          )
        }
      })
    })
    // const list = computed(() => {
    //   return (slots.default?.()?.[0].children as any)?.map((item: any, index: number) => {
    //     const property = propertiesRef.value[index]
    //     return {
    //       key: property.key,
    //       title: property.title,
    //       flex: property.flex,
    //       description: property.description,
    //       hiddenTitle: property.isSuite,
    //       comp: markRaw(item)
    //     }
    //   })
    // })

    return () => {
      // return <SuiteWidget list={list.value} />
      return (
        <div class="w_suite" {...props.config}>
          {propertiesRef.value.map((item, index) => {
            const property = item
            return (
              <div class={[`w_suite-item jsf-ui-grid-col-${property.flex}`]}>
                {item.comp}
                {!property.isSuite &&
                  (property.description ? (
                    <Tooltip title={property.description}>
                      <small class="w_suite-item__label --help">{property.title || property.key}</small>
                    </Tooltip>
                  ) : (
                    <small class="w_suite-item__label">{property.title || property.key}</small>
                  ))}
              </div>
            )
          })}
        </div>
      )
    }
  }
})
