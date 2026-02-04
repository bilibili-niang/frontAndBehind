import { Schema } from '@pkg/jsf'
import NavigatorSelector from '../../../views/editor/configure/navigator-selector'
import { ImageDefine } from '@pkg/core'
import mapCenter from './mapCenter'
import { Icon, Switch } from '@pkg/ui'
import useCanvasStore from '../../../stores/canvas/index'
import useEditorStore from '../../../stores/editor'
import { computed } from 'vue'

const firstSwiper = computed(() => {
  const editor = useEditorStore()
  if (!editor.currentCanvas) return undefined
  const cs: any = useCanvasStore()
  const nodes: any[] = cs?.layerTree?.menuNodes || []
  const node = nodes.find(
    (n) => n?.depth === 0 && n?.$component?.key === 'swiper' && !(n.hidden || n.inheritHidden)
  )
  return node?.$component
})

const toFirstSwiper = () => {
  useCanvasStore().selectComponent(firstSwiper.value!.id)
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
          }
          // sharePreview: {
          //   title: '分享预览',
          //   type: 'object',
          //   widget: 'share-preview',
          //   'ui:condition': {
          //     conditions: [
          //       ['shareType', 'equal', 'default'],
          //       ['shareType', 'equal', 'custom']
          //     ],
          //     relation: 'or'
          //   }
          // }
        }
      },
      navigator: {
        title: '导航',
        type: 'object',
        config: {
          icon: 'click'
        },
        properties: {
          // theme: {
          //   title: '主题',
          //   type: 'object',
          //   'widget': '#theme',
          //   'pure': true
          // },
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
                widget: (props) => {
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
              }
            }
          }
        }
      },
      permission: {
        title: '访问权限',
        type: 'object',
        config: {
          icon: 'people-top-card'
        },
        hidden: true,
        properties: {
          type: {
            title: '权限类型',
            type: 'string',
            widget: 'select',
            description: (
              <div>
                <div>1. 不限制：任何人都可以访问</div>
                <div>2. 地理中心点半径内：仅开启定位后，且在指定中心点半径范围内可访问</div>
                <div>3. 地理位置区域内：仅开启定位后，且在指定区域内可访问</div>
                <div>4. 省市区：仅开启定位后，且在指定省／市／区内可访问</div>
                <div>5. 密码访问：输入密码后可访问</div>
              </div>
            ),
            config: {
              placeholder: '不限制',
              options: [
                { label: '不限制', value: 'none' },
                { label: '地理中心点半径内', value: 'location' },
                { label: '地理位置区域内', value: 'area' },
                { label: '省／市／区', value: 'city', disabled: true },
                { label: '密码访问', value: 'password' }
              ]
            }
          },
          location: {
            title: '地理位置',
            type: 'object',
            widget: 'suite',
            condition: (r) => r.permission?.type === 'location',
            properties: {
              center: {
                title: '地图中心点',
                type: 'object',
                widget: mapCenter
              }
            }
          },
          password: {
            title: '访问密码',
            type: 'string',
            condition: (r) => r.permission?.type === 'password',
            required: true,
            config: {
              type: 'password',
              placeholder: '请输入'
            }
          },
          _password: {
            type: 'null',
            pure: true,
            condition: (r) => r.permission?.type === 'password',
            widget: () => {
              return (
                <div class="color-info" style="padding-left:28px">
                  <Icon name="info"/>
                  &nbsp;设置后将加密，如忘记密码可重新设置
                </div>
              )
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
        backgroundHeight: 0
      }
    }
  },
  slots: {
    theme: NavigatorSelector
  }
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
