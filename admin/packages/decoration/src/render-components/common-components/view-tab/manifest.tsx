import { CommonWidgetPropsDefine } from '@anteng/jsf'
import { defineSchema } from '@anteng/jsf/src/utils/schema'
import { defineComponent } from 'vue'
import useCanvasStore from '../../../stores/canvas'
import { storeToRefs } from 'pinia'
import { Button } from '@anteng/ui'
import container from './view-tab-container'

const List = defineComponent({
  props: {
    ...CommonWidgetPropsDefine
  },
  setup(props) {
    const canvasStore = useCanvasStore()
    const { currentSelectedComponentId, components } = storeToRefs(canvasStore)
    const onAdd = () => {
      canvasStore.addComponent(container, currentSelectedComponentId.value!, 'inside')
    }
    return () => {
      return (
        <div style="padding: 12px 24px;">
          <Button type="primary" size="middle" onClick={onAdd}>
            ＋ 添加分页
          </Button>
          <div class="color-primary" style="font-size:12px;margin-top:10px;">
            请确保直接子节点只有分页容器，其他组件将失效
          </div>
          <div class="color-disabled" style="font-size:12px;margin-top:10px;">
            将组件拖拽到容器内部添加，示例如图：
          </div>
          <img
            style="width:100%;border:2px solid rgba(255, 255, 255, 0.2);border-radius:5px;margin-top:10px"
            src="https://dev-cdn.null.cn/upload/3fff422085b94deceb50d45162669b0b.png"
            alt=""
          />
        </div>
      )
    }
  }
})

export default {
  schema: defineSchema({
    type: 'object',
    properties: {
      _list: {
        title: '分页列表',
        type: 'null',
        widget: List,
        pure: true
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
