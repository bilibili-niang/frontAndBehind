import { title } from 'process'

export default {
  schema: {
    type: 'object',
    properties: {
      list: {
        title: '节点列表',
        type: 'array',
        items: {
          type: 'object',
          properties: {
            image: {
              title: '图标',
              type: 'object',
              widget: 'image'
            },
            action: {
              title: '点击动作',
              type: 'object',
              widget: 'action'
            },
            customSize: {
              title: '独立尺寸',
              type: 'object',
              widget: 'suite',
              enableKey: 'customSizeEnable',
              properties: {
                width: {
                  title: '宽度',
                  type: 'number',
                  config: {
                    placeholder: '统一尺寸',
                    flex: 12,
                    suffix: 'px',
                    min: 24,
                    max: 300
                  }
                },
                height: {
                  title: '高度',
                  type: 'number',
                  config: {
                    placeholder: '统一尺寸',
                    flex: 12,
                    suffix: 'px',
                    min: 24,
                    max: 300
                  }
                }
              }
            }
          }
        }
      },
      scrollTop: {
        title: '显示距离',
        type: 'number',
        widget: 'number',
        description: '当页面滚动距离超过指定位置时才显示，默认 0 始终显示',
        config: {
          suffix: 'px'
        }
      },
      placement: {
        title: '对齐方式',
        type: 'string',
        widget: 'select',
        config: {
          options: [
            { label: '右侧 - 底部', value: 'right-bottom' },
            { label: '右侧 - 居中', value: 'right-center' },
            { label: '右侧 - 顶部', value: 'right-top' },
            { label: '底部 - 左侧', value: 'bottom-left' },
            { label: '底部 - 居中', value: 'bottom-center' },
            { label: '底部 - 右侧', value: 'bottom-right' },
            { label: '左侧 - 顶部', value: 'left-top' },
            { label: '左侧 - 居中', value: 'left-center' },
            { label: '左侧 - 底部', value: 'left-bottom' }
          ]
        }
      },
      size: {
        title: '尺寸',
        type: 'number',
        widget: 'slider',
        config: {
          suffix: 'px',
          min: 24,
          max: 108
        }
      },

      backgroundColor: {
        title: '背景色',
        type: 'string',
        widget: 'color'
      },
      borderRadius: {
        title: '圆角',
        type: 'array',
        widget: 'border-radius'
      },
      shadow: {
        title: '投影',
        type: 'object',
        widget: 'suite',
        properties: {
          color: {
            title: '投影颜色',
            type: 'string',
            widget: 'color'
          },
          length: {
            title: '投影扩散',
            type: 'number',
            widget: 'slider',
            config: {
              suffix: '%',
              min: 0,
              max: 100
            }
          }
        }
      },
      gap: {
        title: '间距',
        type: 'number',
        widget: 'slider',
        config: {
          suffix: 'px',
          min: 0,
          max: 24
        }
      },
      padding: {
        title: '边距',
        type: 'object',
        widget: 'suite',
        properties: {
          top: {
            title: '上下边距',
            type: 'number',
            widget: 'slider',
            config: {
              suffix: 'px',
              min: 0,
              max: 24
            }
          },
          right: {
            title: '左右边距',
            type: 'number',
            widget: 'slider',
            config: {
              suffix: 'px',
              min: 0,
              max: 24
            }
          }
        }
      },
      offset: {
        title: '偏移',
        type: 'object',
        widget: 'suite',
        properties: {
          y: {
            title: '上下偏移',
            type: 'number',
            widget: 'slider',
            config: {
              suffix: 'px',
              min: -200,
              max: 200
            }
          },
          x: {
            title: '左右偏移',
            type: 'number',
            widget: 'slider',
            config: {
              suffix: 'px',
              min: -200,
              max: 200
            }
          }
        }
      },
      collapse: {
        title: '页面滑动时收起',
        type: 'object',
        enableKey: 'enable',
        enableKeyAsProperty: true,
        widget: 'group',
        properties: {
          mode: {
            title: '收起方式',
            type: 'string',
            widget: 'select',
            config: {
              options: [
                { label: '渐隐', value: 'fade-out' },
                { label: '向屏幕边缘淡出', value: 'slide-out' }
              ]
            }
          },
          opacity: {
            title: '不透明度',
            type: 'number',
            widget: 'slider',
            config: {
              suffix: '%',
              min: 0,
              max: 100
            }
          },
          offset: {
            title: '隐藏尺寸',
            type: 'number',
            widget: 'slider',
            condition: (rootValue: any) => rootValue.collapse.mode === 'slide-out',
            config: {
              suffix: '%',
              min: 0,
              max: 100
            }
          },
          delay: {
            title: '还原延迟',
            type: 'number',
            widget: 'slider',
            config: {
              suffix: 's',
              min: 1,
              max: 3,
              step: 0.2
            }
          }
        }
      }
    }
  },
  default: {
    list: [],
    placement: 'right-bottom',
    backgroundColor: 'rgba(255, 255, 255, 0)',
    shadow: {
      color: 'rgba(0, 0, 0, 0.4)',
      length: 20
    },
    size: 44,
    gap: 8,
    scrollTop: 0,
    padding: {
      top: 12,
      right: 12
    },
    offset: {
      x: 0,
      y: 0
    },
    collapse: {
      mode: 'slide-out',
      enable: true,
      opacity: 30,
      offset: 70,
      delay: 1
    }
  }
}
