import { Schema } from '@anteng/jsf'
import { ImageDefine } from '@anteng/core'
import { Icon, Switch } from '@anteng/ui'
import useCanvasStore from '../stores/canvas'
import { computed } from 'vue'
import useEditorStore from '../stores/editor'

const firstSwiper = computed(() => {
  const editor = useEditorStore()
  if (!editor.currentCanvas) return undefined
  const canvasStore = useCanvasStore() as any
  const nodes: any[] = canvasStore?.layerTree?.menuNodes || []
  // 只取非嵌套（depth===0）且未隐藏的第一个轮播图
  const node = nodes.find(
    (n: any) => n?.depth === 0 && n?.$component?.key === 'swiper' && !(n.hidden || n.inheritHidden)
  )
  return node?.$component
})

const toFirstSwiper = () => {
  const target = firstSwiper.value
  if (!target) return
  useCanvasStore().selectComponent(target.id)
}

// 将动态颜色的内联 widget 提取为独立组件
const DynamicColorWidget = (props: any) => {
  return (
    <div style="display:flex;align-items:center;gap:8px;height:36px">
      <Switch checked={props.value} onChange={props.onChange}/>
      {firstSwiper.value ? (
        <div
          class="color-disabled"
          style="margin-left:8px;white-space:nowrap;overflow:hidden;"
        >
          已关联&nbsp;
          <a onClick={toFirstSwiper}>
            <span>{firstSwiper.value.name}&nbsp;</span>
            <Icon name="right"/>
          </a>
        </div>
      ) : (
        <span class="color-disabled">未添加任何轮播图组件</span>
      )}
    </div>
  )
}

export default {
  schema: {
    title: '页面',
    type: 'object',
    widget: 'menu',
    properties: {
      basic: {
        title: '基础',
        type: 'object',
        config: {
          icon: 'check-one'
        },
        properties: {
          name: {
            type: 'string',
            title: '页面名称',
            config: {
              placeholder: '必填，请输入'
            }
          },
          background: {
            title: '背景填充',
            description: '未启用时，默认页面背景为 #F5F5F5',
            type: 'string',
            widget: 'color',
            enableKey: 'backgroundEnable'
          },
          shareType: {
            type: 'string',
            title: '分享类型',
            widget: 'radio-button',
            config: {
              options: [
                { label: '不允许', value: 'none' },
                { label: '默认', value: 'default' },
                { label: '自定义', value: 'custom' }
              ]
            }
          },
          shareConfig: {
            type: 'object',
            title: '分享配置',
            widget: 'suite',
            condition: (rootValue: any) => {
              return rootValue.basic.shareType === 'custom'
            },
            properties: {
              title: {
                type: 'string',
                title: '标题',
                config: {
                  placeholder: '必填，请输入'
                }
              },
              subtitle: {
                type: 'string',
                title: '副标题',
                config: {
                  placeholder: '仅H5、海报有效'
                }
              },
              image: {
                type: 'string',
                title: '图片',
                widget: 'image'
              }
            }
          },
          buttons: {
            title: '导航按钮',
            type: 'object',
            widget: 'suite',
            description: '只控制左侧两个按钮的显隐',
            properties: {
              leftBack: { title: '左侧-返回', type: 'boolean' },
              leftMenu: { title: '左侧-快捷导航', type: 'boolean' }
            }
          }
        }
      },
      navigator: {
        title: '导航',
        type: 'object',
        config: {
          icon: 'click'
        },
        properties: {
          title: {
            title: '标题',
            type: 'string',
            config: {
              placeholder: '选填'
            }
          },
          navigationBarTextStyle: {
            title: '颜色1',
            type: 'string',
            widget: 'radio-button',
            config: {
              options: [
                { label: '黑色', value: 'black' },
                { label: '白色', value: 'white' }
              ]
            }
          },
          navigationBarTextStyleFixed: {
            title: '颜色2',
            type: 'string',
            description: '当页面滚动一定距离后，导航栏颜色将进行切换',
            widget: 'radio-button',
            config: {
              options: [
                { label: '黑色', value: 'black' },
                { label: '白色', value: 'white' }
              ]
            }
          },
          backgroundColor: {
            title: '背景色',
            type: 'string',
            widget: 'color'
          },
          immersion: {
            title: '沉浸式',
            type: 'boolean'
          },
          foreground: {
            title: '前景',
            type: 'object',
            widget: 'group',
            enableKey: 'enable',
            enableKeyAsProperty: true,
            properties: {
              type: {
                title: '类型',
                type: 'string',
                widget: 'radio-button',
                config: {
                  options: [
                    { label: '颜色', value: 'color' },
                    { label: '图片', value: 'image' }
                  ]
                }
              },
              backgroundColor: {
                title: '颜色',
                type: 'string',
                widget: 'color',
                condition: (rootValue: any) => {
                  return rootValue.navigator.foreground.type === 'color'
                }
              },
              backgroundImage: {
                title: '背景图',
                type: 'string',
                widget: 'image',
                condition: (rootValue: any) => {
                  return rootValue.navigator.foreground.type === 'image'
                }
              },
              backgroundHeight: {
                title: '背景高度',
                type: 'number',
                widget: 'slider',
                config: {
                  suffix: 'px',
                  min: 0,
                  max: 1000
                }
              },
              dynamicColor: {
                title: '动态颜色',
                type: 'boolean',
                description: (
                  <div>
                    <div>
                      开启后 <u style="text-underline-offset:4px;">第一个轮播图</u>{' '}
                      组件(非嵌套)将支持配置图片「主色调」
                    </div>
                    <div>若未配置，将仍以上方设置的颜色为准</div>
                    <div>注意：为了展示效果顺畅自然，轮播图上方组件不宜过多（高度过高）</div>
                  </div>
                ),
                widget: DynamicColorWidget
              }
            }
          }
        }
      }
    }
  } as Schema,
  default: {
    basic: {
      name: '',
      remark: '',
      backgroundEnable: false,
      background: 'rgba(255, 255, 255, 0)',
      shareType: 'default',
      shareConfig: {
        title: '',
        subtitle: '',
        image: ''
      },
      // 默认开启导航按钮：左侧返回与左侧快捷导航
      buttons: {
        leftBack: true,
        leftMenu: true
      }
    },
    navigator: {
      theme: 'basic',
      title: '导航栏标题',
      navigationBarTextStyle: 'black',
      navigationBarTextStyleFixed: 'black',
      backgroundColor: '#ffffff',
      immersion: false,
      foreground: {
        enable: false,
        type: 'color',
        backgroundColor: '#59A9FF',
        backgroundHeight: 250
      }
    }
  },
  /* slots: {
   theme: NavigatorSelector
   }*/
}

export interface Page {
  basic: {
    name: string
    remark: string
    backgroundEnable: boolean
    background: string
    shareType: string
    shareConfig: {
      title: string
      subtitle: string
      image: string
    }
  }
  navigator: {
    theme: string
    title: string
    navigationBarTextStyle: 'black' | 'white' | string
    navigationBarTextStyleFixed: 'black' | 'white' | string
    backgroundColor: string
    immersion: boolean
    foreground: {
      enable: boolean
      type: 'color' | 'image'
      backgroundColor: string
      backgroundImage: ImageDefine
      backgroundHeight: number
    }
  }
}
