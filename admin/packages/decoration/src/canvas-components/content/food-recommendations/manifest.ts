import { Schema } from '@pkg/jsf'

export interface foodRecommendationsConfig {
  list: {
    title: string
    description: string
    images: string[]
  }[]
  arrow: {
    able: boolean
    enable: boolean
    color: string
    size: number
    text: string
    offsetX: number
    offsetY: number
  }
  titleFontSize: number
  ratio: {
    width: number
    height: number
    objectFit: string
  }
  arrowAction: {}
  titleColor: string
  foodTitle: {
    titlePosition: string
    mainTitleSize: number
    mainTitleColor: string
    mainTitleWeight: string
    subTitleSize: number
    subTitleColor: string
    gradientsColor: string
  }
}

export default {
  key: 'food-recommendations',
  name: '美食推荐',
  version: '0.1.0',
  schema: {
    type: 'object',
    properties: {
      list: {
        title: '美食列表',
        type: 'array',
        config: {
          itemTitle: '美食'
        },
        items: {
          title: '选择美食',
          type: 'object',
          widget: 'information-selector'
        }
      },
      titleColor: {
        title: '标题颜色',
        type: 'string',
        widget: 'color'
      },
      titleFontSize: {
        title: '标题尺寸',
        type: 'number',
        config: {
          flex: 12,
          min: 12,
          max: 32,
          suffix: 'px'
        }
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
          },
          offsetX: {
            title: 'X轴偏移',
            type: 'number',
            config: {
              flex: 12,
              suffix: 'px'
            }
          },
          offsetY: {
            title: 'Y轴偏移',
            type: 'number',
            config: {
              flex: 12,
              suffix: 'px'
            }
          }
        }
      },
      arrowAction: {
        title: '箭头点击事件',
        type: 'object',
        widget: 'action'
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
      foodTitle: {
        title: '标题配置',
        type: 'object',
        widget: 'suite',
        properties: {
          titlePosition: {
            title: '标题位置',
            type: 'string',
            widget: 'select',
            config: {
              flex: 24,
              options: [
                { label: '里面', value: 'inside' },
                { label: '外面', value: 'outside' }
              ]
            }
          },
          gradientsColor: {
            title: '标题渐变色',
            type: 'string',
            widget: 'color',
            config: {
              flex: 24
            }
          },
          mainTitleSize: {
            title: '主标题尺寸',
            type: 'number',
            config: {
              flex: 12,
              min: 12,
              max: 32,
              suffix: 'px'
            }
          },
          mainTitleColor: {
            title: '主标题颜色',
            type: 'string',
            config: {
              flex: 12
            },
            widget: 'color'
          },
          mainTitleWeight: {
            title: '主标题字重',
            type: 'string',
            widget: 'select',
            config: {
              options: [
                { label: '正常', value: 'normal' },
                { label: '加粗', value: 'bold' }
              ],
              flex: 24
            }
          },
          subTitleSize: {
            title: '副标题尺寸',
            type: 'number',
            config: {
              flex: 12,
              min: 10,
              max: 32,
              suffix: 'px'
            }
          },
          subTitleColor: {
            title: '副标题颜色',
            config: {
              flex: 12
            },
            type: 'string',
            widget: 'color'
          }
        }
      }
    }
  } as Schema,
  default: {
    list: [
      {
        title: '清蒸鲈鱼',
        description: '酥脆可口,鲜嫩多汁',
        images: ['https://p3.itc.cn/images01/20210405/440161be1d3949e6b575760218996d55.jpeg']
      },
      {
        title: '紫苏味牛蛙',
        description: '老远都得闻到',
        images: ['https://pic.imgdb.cn/item/6662b87e5e6d1bfa05f6cc66.jpg']
      },
      {
        title: '同安封肉',
        description: '肥而不腻，肉质嫩滑',
        images: ['https://pic.imgdb.cn/item/6662b8615e6d1bfa05f6a812.jpg']
      },
      {
        title: '厦门沙茶面',
        description: '沙茶汤',
        images: ['https://pic.imgdb.cn/item/6662bee05e6d1bfa05feb6fc.jpg']
      }
    ],
    arrow: {
      able: true,
      enable: true,
      color: 'rgba(0,0,0,1)',
      size: 14,
      text: '查看更多'
    },
    titleFontSize: 16,
    ratio: {
      width: 1,
      height: 1,
      objectFit: 'fill'
    },
    foodTitle: {
      gradientsColor: 'rgba(0, 0, 0, .1)',
      titlePosition: 'inside',
      mainTitleSize: 15,
      mainTitleColor: 'rgba(0,0,0,1)',
      mainTitleWeight: 'normal',
      subTitleSize: 12,
      subTitleColor: 'rgba(0,0,0,.9)'
    }
  },
  defaultAttrs: {}
}
