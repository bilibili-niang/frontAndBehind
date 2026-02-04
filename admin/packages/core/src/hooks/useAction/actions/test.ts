import { PRESET_SCHEMA } from '@pkg/jsf'
import { defineAction } from '../utils'

export default defineAction({
  key: 'test',
  title: '测试一下名字很长是什么效果啊啊啊',
  schema: {
    title: '二维码',
    type: 'object',
    properties: {
      value: {
        title: '内容',
        type: 'string',
        description: '支持从数据中获取二维码内容'
      },
      level: {
        title: '纠错等级',
        description: '纠错等级越高，能储存的信息就越少，但能够纠正损坏的部分就越多。',
        type: 'string',
        widget: 'select',
        config: {
          options: [
            { value: 'L', label: 'Low（7%）' },
            { value: 'M', label: 'Medium（15%）' },
            { value: 'Q', label: 'Quartile（25%）' },
            { value: 'H', label: 'High（30%）' }
          ]
        }
      },
      fill: {
        title: '填充',
        type: 'object',
        widget: 'suite',
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
          }
        }
      },
      margin: {
        title: '边距',
        type: 'number',
        description: '非固定度量，根据图形复杂度而定',
        config: {
          min: 0,
          max: 10,
          suffix: '格'
        }
      },
      border: PRESET_SCHEMA.BORDER,
      borderRadius: PRESET_SCHEMA.BORDER_RADIUS,
      logo: {
        title: 'logo',
        type: 'object',
        widget: 'group',
        enableKey: 'enable',
        enableKeyAsProperty: true,
        properties: {
          url: {
            title: '图片链接',
            type: 'string',
            widget: 'image'
          },
          size: {
            title: '尺寸',
            type: 'object',
            widget: 'suite',
            properties: {
              width: {
                title: '宽度',
                type: 'number',
                config: {
                  suffix: 'px',
                  flex: 12
                }
              },
              height: {
                title: '高度',
                type: 'number',
                config: {
                  suffix: 'px',
                  flex: 12
                }
              }
            }
          },
          backgroundColor: {
            title: '背景颜色',
            type: 'string',
            widget: 'color'
          },
          border: PRESET_SCHEMA.BORDER,
          borderRadius: PRESET_SCHEMA.BORDER_RADIUS
        }
      }
    }
  },
  default: {
    value: 'hello',
    level: 'H',
    fill: {
      color: '#000000',
      backgroundColor: '#ffffff'
    },
    margin: 0,
    border: {
      enable: false,
      shape: 'solid',
      width: 1,
      color: '#000000'
    },
    borderRadius: [0, 0, 0, 0],
    logo: {
      enable: true,
      url: '//cdn-upload.datav.aliyun.com/upload/download/1624523042570-O1CN017UKdal1Y800Uu5bcT_!!6000000003013-2-tps-100-100.png',
      size: {
        width: 50,
        height: 50
      },
      backgroundColor: '#ffffff',
      border: {
        enable: false,
        shape: 'solid',
        width: 1,
        color: '#ffffff'
      },
      borderRadius: [0, 0, 0, 0]
    }
  }
})
