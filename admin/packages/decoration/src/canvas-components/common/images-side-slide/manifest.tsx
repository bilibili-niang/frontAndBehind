import { manifest as titleManifest } from '@pkg/decoration/src/canvas-components/common/title/render'

export default {
  schema: {
    type: 'object',
    properties: {
      title: {
        ...titleManifest.schema,
        title: '标题',
        widget: 'group',
        enableKey: 'titleEnable',
        config: {
          defaultCollapsed: true
        }
      },
      data: {
        title: '数据源',
        type: 'array',
        items: {
          type: 'object',
          properties: {
            image: {
              title: '图片',
              type: 'object',
              widget: 'image',
              required: true
            },
            action: {
              title: '点击事件',
              type: 'object',
              widget: 'action'
            },
            title: {
              title: '标题',
              type: 'string',
              config: {
                placeholder: '选填，默认不显示'
              }
            },
            subtitle: {
              title: '副标题',
              type: 'string',
              config: {
                placeholder: '选填，默认不显示'
              }
            },
            linearGradient: {
              title: '渐变蒙层',
              description: '仅在有「标题」或「副标题」且 文本位置为「图片底部」时显示',
              type: 'object',
              widget: 'suite',
              enableKey: 'linearGradientEnable',
              condition: (r: any) => r.text?.placement === 'bottom',
              properties: {
                color: {
                  title: '起始颜色',
                  type: 'string',
                  widget: 'color',
                  default: '#000'
                },
                end: {
                  title: '结束位置',
                  type: 'number',
                  widget: 'slider',
                  default: 40,
                  config: {
                    min: 0,
                    max: 100,
                    step: 1,
                    suffix: '%'
                  }
                }
              }
            }
          }
        },
        config: {
          itemDefault: {
            linearGradientEnable: true,
            linearGradient: {
              color: '#000',
              end: 40
            }
          }
        }
      },
      text: {
        title: '文本',
        type: 'object',
        widget: 'group',
        config: {
          defaultCollapsed: true
        },
        properties: {
          placement: {
            title: '位置',
            type: 'string',
            widget: 'radio-button',
            config: {
              options: [
                { label: '图片底部', value: 'bottom' },
                { label: '图片下方', value: 'under' }
              ]
            }
          },
          colorBottom: {
            title: '颜色',
            type: 'string',
            widget: 'color',
            condition: (rootValue: any) => rootValue?.text?.placement === 'bottom'
          },
          colorUnder: {
            title: '颜色',
            type: 'string',
            widget: 'color',
            condition: (rootValue: any) => rootValue?.text?.placement === 'under'
          }
        }
      },
      col: {
        title: '每行个数',
        type: 'number',
        description: '数量超过将换行显示',
        config: {
          min: 1,
          max: 100
        }
      },
      flexGrow: {
        title: '弹性伸展',
        type: 'boolean',
        description: (
          <div>
            <p>当每行显示仍有剩余空间时，自动拉伸节点占满剩余空间。</p>
            <img
              style="width: 400px;"
              src="https://dev-cdn.dev-cdn.ice.cn/upload/20240613/2d748baba0f36d04ae999bd725ae0eb3.png"
              alt=""
            />
          </div>
        )
      },
      itemWidth: {
        title: '图片宽度',
        type: 'number',
        widget: 'slider',
        config: {
          min: 80,
          max: 360
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
              options: [
                { label: '拉伸', value: 'fill' },
                { label: '包含', value: 'contain' },
                { label: '覆盖', value: 'cover' }
              ],
              flex: 10
            }
          }
        }
      },
      borderRadius: {
        title: '图片圆角',
        type: 'array',
        widget: 'border-radius'
      },
      gap: {
        title: '间距',
        type: 'number',
        widget: 'slider',
        config: {
          min: 0,
          max: 20,
          suffix: 'px'
        }
      }
    }
  },
  default: {
    title: titleManifest.default,
    titleEnable: false,
    data: [],
    text: {
      placement: 'bottom',
      colorBottom: '#fff',
      colorUnder: '#000'
    },
    col: 3,
    flexGrow: true,
    itemWidth: 100,
    borderRadius: [10, 10, 10, 10],
    ratio: {
      width: 4,
      height: 3,
      objectFit: 'cover'
    },
    gap: 8
  },
  defaultAttrs: {}
}
