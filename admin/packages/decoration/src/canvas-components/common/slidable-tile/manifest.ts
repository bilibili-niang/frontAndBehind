import { Schema } from '@pkg/jsf'
import { Icon } from '@pkg/ui'
import { h } from 'vue'

const notCustomCondition = (rootValue: any, parentalValue: any) => {
  return parentalValue?.type !== 'custom'
}

const customCondition = (rootValue: any, parentalValue: any) => {
  return parentalValue?.type === 'custom'
}

export default {
  schema: {
    type: 'object',
    properties: {
      autoplay: {
        title: '自动轮播',
        type: 'number',
        widget: 'slider',
        enableKey: 'autoplayEnable',
        config: {
          min: 3,
          max: 10,
          suffix: 's',
          step: 0.5
        }
      },
      __: {
        title: '提示',
        type: 'null',
        pure: true,
        widget: (props) => {
          if ((props.rootValue?.list?.length || 0) < 2) {
            return h(
              'div',
              {
                class: 'color-error',
                style: 'margin: 12px'
              },
              [h(Icon, { name: 'info' }), ' 提示：至少需要 2 个瓷片才可显示']
            )
          } else if ((props.rootValue?.list?.length || 0) < 3) {
            return h(
              'div',
              {
                class: 'color-info',
                style: 'margin: 12px'
              },
              [h(Icon, { name: 'info' }), ' 提示：至少需要 3 个瓷片才可滑动交互']
            )
          }
          return null
        }
      },
      list: {
        title: '瓷片列表',
        type: 'array',
        config: {
          itemTitle: '瓷片',
          itemDefault: {
            title: '主标题内容',
            subtitle: '副标题内容',
            icon: {
              url: 'http://dev-cdn.ice-test.oss-cn-hangzhou.aliyuncs.com/upload/4d0934d2b8e54fc74331f7f3ce48a6fe.png'
            },
            backgroundColor: '#fff',
            action: null,
            primaryIcon: {
              type: 'default',
              replacedIcon: null,
              size: {
                width: 50,
                height: 50
              },
              offset: {
                x: 0,
                y: 0
              }
            },
            primaryContent: {
              type: 'default',
              customImage: null,
              linearGradientEnable: false,
              linearGradient: {
                deg: 180,
                from: 'rgba(255, 0, 0, 0.1)',
                to: 'rgba(255, 255, 255, 0.1)'
              },
              title: {
                text: null,
                color: '#000000',
                icon: null
              },
              subtitle: {
                text: null,
                text2: null,
                color: 'rgba(0, 0, 0, 0.7)'
              },
              actionEnable: true,
              action: {
                text: null,
                arrow: true,
                color: '#1677ff'
              }
            }
          }
        },
        items: {
          title: '瓷片',
          type: 'object',
          properties: {
            title: {
              title: '主标题',
              type: 'string',
              required: true
            },
            subtitle: {
              title: '副标题',
              type: 'string',
              required: true
            },
            icon: {
              title: '图标',
              type: 'object',
              widget: 'image',
              required: true,
              config: {
                simple: true,
                ratio: '1:1',
                width: 100
              }
            },
            // backgroundColor: {
            //   title: '背景颜色',
            //   type: 'string',
            //   widget: 'color'
            // },
            action: {
              title: '点击事件',
              type: 'object',
              widget: 'action',
              required: true
            },
            primaryIcon: {
              title: '自定义激活状态图标',
              type: 'object',
              widget: 'group',
              properties: {
                type: {
                  title: '动画类型',
                  type: 'string',
                  widget: 'radio-button',
                  config: {
                    options: [
                      { label: '默认', value: 'default' },
                      { label: '隐藏', value: 'hide' },
                      { label: '替换', value: 'replace' }
                    ]
                  }
                },
                replacedIcon: {
                  title: '替换图标',
                  type: 'object',
                  widget: 'image',
                  condition: (rootValue, parentalValue) => {
                    return parentalValue?.type === 'replace'
                  },
                  config: {
                    simple: true,
                    ratio: '1:1',
                    width: 100
                  }
                },
                size: {
                  title: '尺寸',
                  type: 'object',
                  widget: 'suite',
                  description: '未激活状态下图标尺寸固定为 50×50',
                  properties: {
                    width: {
                      title: '宽度',
                      type: 'number',
                      widget: 'slider',
                      config: {
                        placeholder: 50,
                        suffix: 'px',
                        min: 0,
                        max: 200,
                        step: 1
                      }
                    },
                    height: {
                      title: '高度',
                      type: 'number',
                      widget: 'slider',
                      config: {
                        placeholder: 50,
                        suffix: 'px',
                        min: 0,
                        max: 200,
                        step: 1
                      }
                    }
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
                      widget: 'slider',
                      config: {
                        placeholder: 0,
                        suffix: 'px',
                        min: -100,
                        max: 100,
                        step: 1
                      }
                    },
                    y: {
                      title: 'Y轴',
                      type: 'number',
                      widget: 'slider',
                      config: {
                        placeholder: 0,
                        suffix: 'px',
                        min: -100,
                        max: 100,
                        step: 1
                      }
                    }
                  }
                }
              }
            },
            primaryContent: {
              title: '自定义激活状态内容',
              type: 'object',
              widget: 'group',
              properties: {
                type: {
                  title: '内容类型',
                  type: 'string',
                  widget: 'radio-button',
                  config: {
                    options: [
                      { label: '默认', value: 'default' },
                      { label: '自定义图片', value: 'custom' }
                    ]
                  }
                },
                customImage: {
                  title: '自定义图片',
                  type: 'object',
                  widget: 'image',
                  description: '建议尺寸：宽高比 5:3，超出将剪裁',
                  config: {
                    ratio: '5:3'
                  },
                  condition: customCondition
                },
                linearGradient: {
                  title: '背景渐变',
                  type: 'object',
                  widget: 'suite',
                  enableKey: 'linearGradientEnable',
                  properties: {
                    deg: {
                      title: '角度',
                      type: 'number',
                      widget: 'slider',
                      config: {
                        min: 0,
                        max: 360,
                        suffix: '°'
                      }
                    },
                    from: {
                      title: '起始颜色',
                      type: 'string',
                      widget: 'color'
                    },
                    to: {
                      title: '结束颜色',
                      type: 'string',
                      widget: 'color'
                    }
                  }
                },
                title: {
                  title: '主标题',
                  type: 'object',
                  widget: 'suite',
                  condition: notCustomCondition,
                  properties: {
                    text: {
                      title: '文本内容',
                      type: 'string',
                      config: {
                        placeholder: '选填，默认同步瓷片主标题'
                      }
                    },
                    color: {
                      title: '颜色',
                      type: 'string',
                      widget: 'color'
                    },
                    icon: {
                      title: '前缀图标',
                      type: 'string',
                      widget: 'image'
                    }
                  }
                },
                subtitle: {
                  title: '副标题',
                  type: 'object',
                  widget: 'suite',
                  condition: notCustomCondition,
                  properties: {
                    text: {
                      title: '第一行文本内容',
                      type: 'string',
                      config: {
                        placeholder: '选填，默认同步瓷片副标题'
                      }
                    },
                    text2: {
                      title: '第二行文本内容',
                      type: 'string',
                      config: {
                        placeholder: '选填，不填则不显示'
                      }
                    },
                    color: {
                      title: '颜色',
                      type: 'string',
                      widget: 'color'
                    }
                  }
                },
                action: {
                  title: '按钮',
                  type: 'object',
                  widget: 'suite',
                  enableKey: 'actionEnable',
                  condition: notCustomCondition,
                  properties: {
                    text: {
                      title: '文本内容',
                      type: 'string',
                      config: {
                        placeholder: '去看看',
                        flex: 18,
                        maxlength: 8
                      }
                    },
                    arrow: {
                      title: '箭头',
                      type: 'boolean',
                      config: {
                        flex: 6,
                        size: 'small'
                      }
                    },
                    color: {
                      title: '颜色',
                      type: 'string',
                      widget: 'color'
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  } as Schema,
  default: {
    autoplayEnable: true,
    autoplay: 5,
    list: []
  }
}
