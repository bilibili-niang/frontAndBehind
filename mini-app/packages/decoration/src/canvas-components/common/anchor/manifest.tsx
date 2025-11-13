import { CommonWidgetPropsDefine } from '@anteng/jsf'
import { defineSchema } from '@anteng/jsf/src/utils/schema'
import { computed, defineComponent } from 'vue'
import useCanvasStore from '../../../stores/canvas'
import { storeToRefs } from 'pinia'
import { Select } from '@anteng/ui'

const ComponentSelect = defineComponent({
  props: {
    ...CommonWidgetPropsDefine
  },
  setup(props) {
    const canvasStore = useCanvasStore()
    const { renderComponents, currentSelectedComponentId } = storeToRefs(canvasStore)

    // const belowComponents = computed(() => {
    //   const index = components.value.findIndex(
    //     (item) => item.id === currentSelectedComponentId.value
    //   )
    //   if (index === -1) return []
    //   return components.value.slice(index + 1)
    // })

    const options = computed(() => {
      const index = renderComponents.value.findIndex(
        (item) => item.id === currentSelectedComponentId.value
      )
      const list = renderComponents.value.slice(index + 1).map((item, i) => {
        return {
          label: item.name,
          value: item.id,
          disabled: false
        }
      })
      list.unshift({
        label: '仅电梯导航下方的组件可选',
        value: '_____',
        disabled: true
      })

      return list
      // return belowComponents.value.map((item) => {
      //   return {
      //     label: item.name,
      //     value: item.id
      //   }
      // })
    })

    return () => {
      return (
        <Select placeholder="请选择组件" options={options.value} {...props} style="width: 100%" />
      )
    }
  }
})

export default {
  schema: defineSchema({
    type: 'object',
    properties: {
      list: {
        title: '导航列表',
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: {
              title: '标题',
              type: 'string',
              required: true
            },
            component: {
              title: '关联组件',
              type: 'string',
              widget: ComponentSelect,
              required: true
            },
            icon: {
              title: '图标',
              type: 'string',
              widget: 'image',
              config: {
                compact: true
              }
            }
          }
        }
      },
      style: {
        title: '整体样式',
        type: 'object',
        widget: 'group',
        properties: {
          iconPlacement: {
            title: '图标位置',
            type: 'string',
            widget: 'radio-button',
            description: '如果设置为“标题上方”，请确保每个节点均 设置／不设置 图标',
            config: {
              options: [
                { label: '不显示', value: 'none' },
                { label: '标题上方', value: 'above' },
                { label: '标题内', value: 'inner' }
              ]
            }
          },
          iconVisible: {
            title: '图标显示',
            type: 'string',
            widget: 'radio-button',
            condition: (r) => r.style?.iconPlacement === 'above',
            config: {
              options: [
                { label: '始终显示', value: 'always' },
                { label: '吸顶时显示', value: 'sticky' }
              ]
            }
          },
          fixedBackgroundColor: {
            title: '吸顶时背景',
            type: 'string',
            widget: 'color'
          }
        }
      },
      itemStyle: {
        title: '按钮样式',
        type: 'object',
        widget: 'group',
        properties: {
          placement: {
            title: '对齐方式',
            type: 'string',
            description: '当按钮总宽超出容器宽度时，按钮对齐方式自动启用为【左对齐】',
            widget: 'select',
            config: {
              options: [
                { label: '左对齐', value: 'left' },
                { label: '居中', value: 'center' },
                { label: '右对齐', value: 'right' }
              ]
            }
          },
          default: {
            title: '默认样式',
            type: 'object',
            widget: 'suite',
            properties: {
              color: {
                title: '标题颜色',
                type: 'string',
                widget: 'color'
              },
              backgroundColor: {
                title: '标题背景色',
                type: 'string',
                widget: 'color'
              },
              fontSize: {
                title: '标题大小',
                type: 'string',
                widget: 'number',
                config: {
                  suffix: 'px',
                  min: 1,
                  max: 200
                }
              }
            }
          },
          active: {
            title: '选中样式',
            type: 'object',
            widget: 'suite',
            properties: {
              color: {
                title: '标题颜色',
                type: 'string',
                widget: 'color'
              },
              backgroundColor: {
                title: '标题背景色',
                type: 'string',
                widget: 'color'
              },
              fontSize: {
                title: '标题大小',
                type: 'string',
                widget: 'number',
                config: {
                  suffix: 'px',
                  min: 1,
                  max: 200
                }
              }
            }
          }
        }
      }
    }
  }),
  default: {
    list: [],
    style: {
      iconPlacement: 'inner',
      iconVisible: 'always',
      fixedBackgroundColor: '#ffffff'
    },
    itemStyle: {
      placement: 'left',
      default: {
        color: '#445566',
        backgroundColor: '#ffffff',
        fontSize: 14
      },
      active: {
        color: '#ffffff',
        backgroundColor: '#000000',
        fontSize: 14
      }
    }
  },
  defaultAttrs: {}
}
