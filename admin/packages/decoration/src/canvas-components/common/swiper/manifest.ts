import { computed } from 'vue'
import useCanvasStore from '../../../stores/canvas'
import useEditorStore from '../../../stores/editor'

export const firstSwiper = computed(() => {
  const editor = useEditorStore()
  if (!editor.currentCanvas) return undefined
  const canvasStore = useCanvasStore() as any
  const nodes: any[] = canvasStore?.layerTree?.menuNodes || []
  // 只取非嵌套（depth===0）且未隐藏的第一个轮播图
  const node = nodes.find(
    (n: any) => n?.depth === 0 && n?.$component?.key === 'swiper' && !(n.hidden || n.inheritHidden)
  )
  if (typeof window !== 'undefined' && localStorage.getItem('swiperDebug') === '1') {
    try {
      console.log('[manifest(canvas)] firstSwiper candidates', nodes
        .filter((n: any) => n?.$component?.key === 'swiper')
        .map((n: any) => ({ id: n.id, depth: n.depth, hidden: !!n.hidden, inheritHidden: !!n.inheritHidden })))
      console.log('[manifest(canvas)] firstSwiper pick', node?.id)
    } catch {}
  }
  return node?.$component
})

export const isNavDynamicForeground = computed(
  () => useCanvasStore().page.navigator?.foreground?.dynamicColor
)

export default {
  schema: {
    title: '轮播图',
    type: 'object',
    properties: {
      images: {
        type: 'array',
        title: '图片',
        items: {
          type: 'object',
          properties: {
            image: {
              type: 'object',
              title: '图片',
              widget: 'action-image'
            },
            themeColor: {
              type: 'string',
              title: '主色调',
              widget: 'color',
              enableKey: 'themeColorEnable',
              description: '此配置仅与 页面 - 导航 - 前景色 相关，独立使用时无任何作用。',
              condition: (config: any) => {
                if (!isNavDynamicForeground.value) return false

                if (firstSwiper.value?.$component.config === config) return true

                return false
              }
            }
          }
        },
        config: {
          itemDefault: {
            image: {
              type: 'single',
              url: ''
            }
          }
        }
      },
      indicator: {
        title: '指示器',
        type: 'object',
        widget: 'group',
        enableKey: 'enable',
        enableKeyAsProperty: true,
        properties: {
          size: {
            title: '尺寸',
            type: 'object',
            widget: 'suite',
            properties: {
              w: {
                title: '宽度',
                type: 'number',
                config: {
                  flex: 12,
                  suffix: 'px'
                }
              },
              h: {
                title: '高度',
                type: 'number',
                config: {
                  flex: 12,
                  suffix: 'px'
                }
              }
            }
          },
          activeSize: {
            title: '选中尺寸',
            type: 'object',
            widget: 'suite',
            properties: {
              w: {
                title: '宽度',
                type: 'number',
                config: {
                  flex: 12,
                  suffix: 'px'
                }
              },
              h: {
                title: '高度',
                type: 'number',
                config: {
                  flex: 12,
                  suffix: 'px'
                }
              }
            }
          },
          color: {
            title: '颜色',
            type: 'string',
            widget: 'color'
          },
          activeColor: {
            title: '选中颜色',
            type: 'string',
            widget: 'color'
          },
          placement: {
            title: '位置',
            type: 'string',
            widget: 'select',
            config: {
              options: [
                { label: '左上方', value: 'topLeft' },
                { label: '上方居中', value: 'top' },
                { label: '右上方', value: 'topRight' },
                { label: '左下方', value: 'bottomLeft' },
                { label: '下方居中', value: 'bottom' },
                { label: '右下方', value: 'bottomRight' }
              ]
            }
          },
          offset: {
            title: '偏移',
            type: 'object',
            widget: 'suite',
            properties: {
              x: {
                title: 'X轴',
                type: 'number',
                config: {
                  flex: 12,
                  suffix: 'px'
                }
              },
              y: {
                title: 'Y轴',
                type: 'number',
                config: {
                  flex: 12,
                  suffix: 'px'
                }
              }
            }
          }
        }
      },
      ratio: {
        title: '图片比例',
        type: 'object',
        widget: 'suite',
        properties: {
          width: {
            title: '宽度',
            type: 'number',
            config: {
              flex: 7,
              controls: false
            }
          },
          height: {
            title: '高度',
            type: 'number',
            config: {
              flex: 7,
              controls: false
            }
          },
          objectFit: {
            title: '适应',
            type: 'string',
            widget: 'select',
            config: {
              flex: 10,
              options: [
                { label: '拉伸', value: 'fill' },
                { label: '包含', value: 'contain' },
                { label: '覆盖', value: 'cover' }
              ]
            }
          }
        }
      },
      borderRadius: {
        title: '图片圆角',
        type: 'array',
        widget: 'border-radius'
      },
      background: {
        title: '图片底色',
        type: 'string',
        widget: 'color'
      },
      autoplay: {
        title: '自动播放',
        type: 'boolean'
      },
      interval: {
        title: '间隔时间',
        type: 'number',
        config: {
          suffix: 'ms'
        }
      },
      transition: {
        title: '过渡时间',
        type: 'number',
        config: {
          suffix: 'ms'
        }
      },
      padding: {
        title: '留白距离',
        type: 'array',
        widget: 'padding'
      }
    }
  },
  default: {
    images: [],
    ratio: {
      width: 8,
      height: 5,
      objectFit: 'fill'
    },
    background: 'rgba(255, 255, 255, 0.4)',
    borderRadius: [10, 10, 10, 10],
    padding: [12, 12, 12, 12],
    autoplay: true,
    interval: 3000,
    transition: 500,
    indicator: {
      enable: true,
      size: {
        w: 8,
        h: 3
      },
      activeSize: {
        w: 16,
        h: 3
      },
      color: 'rgba(255, 255, 255, 0.4)',
      activeColor: 'rgba(255, 255, 255, 1)',
      placement: 'bottom',
      offset: {
        x: 0,
        y: -12
      }
    }
  }
}
