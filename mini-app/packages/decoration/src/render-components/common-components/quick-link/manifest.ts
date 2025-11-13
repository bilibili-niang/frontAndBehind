export default {
  schema: {
    type: 'object',
    properties: {
      list: {
        title: '节点列表',
        type: 'array',
        config: {
          itemTitle: '节点',
          itemDefault: {
            title: '标题',
            image: {
              url: '',
              width: 0,
              height: 0
            },
            action: {
              key: '',
              remark: '',
              config: {}
            },
            badge: {
              enable: false,
              content: '',
              color: '#ffffff',
              backgroundColor: '#ff4e00'
            }
          }
        },
        items: {
          title: '节点',
          type: 'object',
          properties: {
            title: {
              title: '标题',
              type: 'string'
            },
            image: {
              title: '图标',
              type: 'object',
              widget: 'image'
            },
            action: {
              title: '点击事件',
              type: 'object',
              widget: 'action'
            },
            badge: {
              title: '角标',
              type: 'object',
              widget: 'suite',
              enableKey: 'enable',
              enableKeyAsProperty: true,
              properties: {
                content: {
                  type: 'string',
                  title: '内容',
                  config: {
                    maxlength: 5,
                    placeholder: '最多5个字'
                  }
                },
                color: {
                  title: '文本颜色',
                  type: 'string',
                  widget: 'color'
                },
                backgroundColor: {
                  title: '背景颜色',
                  type: 'string',
                  widget: 'color'
                }
              }
            }
          }
        }
      },
      // row: {
      //   title: '最多几行',
      //   type: 'number',
      //   description: '若实际行数超过数值则分页显示，值为 0 时表示不限制。',
      //   config: {
      //     min: 0
      //   }
      // },
      titleColor: {
        title: '标题颜色',
        type: 'string',
        widget: 'color'
      },
      borderRadius: {
        title: '图标圆角',
        type: 'array',
        widget: 'border-radius'
      },
      interaction: {
        title: '交互类型',
        type: 'string',
        widget: 'radio-button',
        config: {
          options: [
            { label: '左右滑动', value: 'slide' },
            { label: '左右翻页', value: 'swipe' }
          ]
        }
      },
      col: {
        title: '每行个数',
        type: 'number',
        config: {
          min: 3,
          max: 100
        },
        condition: (rootValue: any) => {
          return rootValue.interaction === 'slide'
        }
      },
      visibleCol: {
        title: '最多显示',
        description: '当行个数超过该值时，将可以左右滑动，支持 4 ~ 6 之间，允许小数。',
        type: 'number',
        config: {
          min: 4,
          max: 6,
          suffix: '个'
        },
        condition: (rootValue: any) => {
          return rootValue.interaction === 'slide'
        }
      },
      swipeCol: {
        title: '每行个数',
        type: 'number',
        config: {
          min: 3,
          max: 6
        },
        condition: (rootValue: any) => {
          return rootValue.interaction === 'swipe'
        }
      },
      row: {
        title: '每页行数',
        type: 'number',
        config: {
          min: 1,
          max: 10
        },
        condition: (rootValue: any) => {
          return rootValue.interaction === 'swipe'
        }
      },
      indicator: {
        title: '滑动指示器',
        type: 'object',
        description: '仅在可滑动(每行个数 > 最多显示)状态下显示',
        widget: 'suite',
        enableKey: 'enable',
        enableKeyAsProperty: true,
        properties: {
          color: {
            title: '颜色',
            type: 'string',
            widget: 'color'
          },
          backgroundColor: {
            title: '背景颜色',
            type: 'string',
            widget: 'color'
          },
          height: {
            title: '高度',
            type: 'number',
            config: {
              suffix: 'px',
              min: 2,
              max: 8,
              flex: 12
            }
          },
          width: {
            title: '宽度',
            type: 'number',
            config: {
              suffix: 'px',
              min: 28,
              max: 100,
              flex: 12
            }
          }
        }
      }
    }
  },
  default: {
    interaction: 'slide',
    col: 5,
    swipeCol: 5,
    row: 2,
    visibleCol: 5,
    // row: 2,
    titleColor: '#333333',
    borderRadius: [0, 0, 0, 0],
    list: [],
    indicator: {
      enable: true,
      color: '#333333',
      backgroundColor: '#e8e8e8',
      width: 48,
      height: 6
    }
  }
}
