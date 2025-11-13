export default {
  schema: {
    type: 'object',
    properties: {
      list: {
        title: '内容',
        type: 'array',
        config: {
          itemDefault: {
            icon: {
              url: '',
              width: 0,
              height: 0
            },
            text: '这是一条消息通知',
            color: '#333333',
            action: {},
            arrow: {
              enable: false,
              color: '#bbbbbb',
              size: 16,
              text: ''
            }
          }
        },
        items: {
          title: '内容',
          type: 'object',
          properties: {
            icon: {
              title: '独立图标',
              type: 'string',
              description: '若未配置独立图标，将显示统一图标',
              widget: 'image'
            },
            text: {
              title: '文字内容',
              type: 'string',
              config: {
                placeholder: '必填，请输入'
              }
            },
            color: {
              title: '颜色',
              type: 'string',
              widget: 'color'
            },
            action: {
              title: '点击事件',
              type: 'object',
              widget: 'action'
            },
            arrow: {
              title: '引导箭头',
              type: 'object',
              widget: 'suite',
              enableKey: 'enable',
              enableKeyAsProperty: true,
              properties: {
                color: { title: '填充颜色', type: 'string', widget: 'color' },
                size: {
                  title: '尺寸',
                  type: 'number',

                  config: {
                    flex: 12,
                    min: 12,
                    max: 32,
                    suffix: 'px'
                  }
                },
                text: {
                  title: '文字',
                  type: 'string',

                  config: {
                    flex: 12,
                    placeholder: '可选'
                  }
                }
              }
            }
          }
        }
      },
      icon: {
        title: '统一图标',
        type: 'string',
        widget: 'image',
        description: '若未配置统一图标，将显示默认图标'
      },
      iconLayout: {
        title: '图标布局',
        type: 'object',
        widget: 'suite',
        properties: {
          width: {
            title: '宽度',
            type: 'number',
            config: {
              flex: 12,
              min: 24,
              max: 64,
              suffix: 'px'
            }
          },
          height: {
            title: '高度',
            type: 'number',
            config: {
              flex: 12,
              min: 24,
              max: 64,
              suffix: 'px'
            }
          },
          marginY: {
            title: '上下边距',
            type: 'number',
            config: {
              flex: 12,
              min: -12,
              max: 24,
              suffix: 'px'
            }
          },
          marginX: {
            title: '左右边距',
            type: 'number',
            config: {
              flex: 12,
              min: -12,
              max: 24,
              suffix: 'px'
            }
          }
        }
      },
      split: {
        title: '分割线',
        type: 'object',
        widget: 'suite',
        enableKey: 'enable',
        enableKeyAsProperty: true,
        properties: {
          color: {
            title: '颜色',
            type: 'string',
            widget: 'color'
          },

          height: {
            title: '高度',
            type: 'number',
            config: {
              flex: 8,
              min: 0,
              max: 64,
              suffix: 'px'
            }
          },
          marginLeft: {
            title: '左边距',
            type: 'number',
            config: {
              flex: 8,
              min: 0,
              max: 12,
              suffix: 'px'
            }
          },
          marginRight: {
            title: '右边距',
            type: 'number',
            config: {
              flex: 8,
              min: 0,
              max: 12,
              suffix: 'px'
            }
          }
        }
      },
      interval: {
        title: '间隔时间',
        type: 'number',
        config: {
          min: 1500,
          max: 10000,
          suffix: 'ms'
        }
      }
    }
  },
  default: {
    list: [],
    icon: {
      url: '',
      width: '',
      height: ''
    },
    iconLayout: {
      width: 36,
      height: 36,
      marginX: 4,
      marginY: 4
    },
    split: {
      enable: false,
      color: '#bbbbbb',
      height: 16,
      marginLeft: 0,
      marginRight: 8
    },
    interval: 3000
  }
}
