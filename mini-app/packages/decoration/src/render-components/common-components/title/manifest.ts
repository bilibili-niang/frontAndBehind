import { PRESET_SCHEMA, getPresetFieldDefault, getPresetFieldSchema } from '@anteng/jsf'

export default {
  schema: {
    type: 'object',
    properties: {
      content: {
        title: '标题文本',
        type: 'string',
        config: {
          placeholder: '请输入标题内容'
        }
      },
      action: {
        title: '点击事件',
        type: 'object',
        widget: 'action'
      },
      font: getPresetFieldSchema(PRESET_SCHEMA.FONT, {
        properties: {
          textAlign: {
            config: {
              options: [
                { label: '左对齐', value: 'left' },
                { label: '水平居中', value: 'center' }
              ]
            }
          }
        }
      }),
      prefixIcon: {
        title: '前缀图标',
        type: 'object',
        widget: 'group',
        enableKey: 'prefixIconEnable',
        properties: {
          image: {
            title: '图标',
            type: 'object',
            widget: 'image'
          },

          width: {
            title: '宽度',
            type: 'number',
            widget: 'slider',
            config: {
              min: 24,
              max: 64,
              suffix: 'px'
            }
          },
          height: {
            title: '高度',
            type: 'number',
            widget: 'slider',
            config: {
              min: 24,
              max: 64,
              suffix: 'px'
            }
          },
          objectFit: {
            title: '图标适应',
            type: 'string',
            widget: 'select',
            config: {
              options: [
                { label: '拉伸', value: 'fill' },
                { label: '包含', value: 'contain' },
                { label: '覆盖', value: 'cover' }
              ]
            }
          },
          marginRight: {
            title: '与文字间距',
            type: 'number',
            widget: 'slider',
            config: {
              suffix: 'px',
              min: -8,
              max: 12,
              step: 1
            }
          }
        }
      },
      arrow: {
        title: '引导箭头',
        type: 'object',
        widget: 'group',
        enableKey: 'enable',
        enableKeyAsProperty: true,
        properties: {
          color: { title: '填充颜色', type: 'string', widget: 'color' },
          size: {
            title: '尺寸',
            type: 'number',
            widget: 'slider',
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
            widget: 'slider',
            config: {
              flex: 12,
              suffix: 'px'
            }
          },
          offsetY: {
            title: 'Y轴偏移',
            type: 'number',
            widget: 'slider',
            config: {
              flex: 12,
              suffix: 'px'
            }
          }
        }
      }
    }
  },
  default: {
    content: '标题内容',
    font: getPresetFieldDefault(PRESET_SCHEMA.FONT, { fontWeight: 'bold', fontSize: 18 }),
    arrow: {
      enable: false,
      color: '#bbbbbb',
      size: 16,
      gap: 8,
      text: '',
      offsetX: 0,
      offsetY: 0
    },
    prefixIconEnable: false,
    prefixIcon: {
      width: 24,
      height: 24,
      objectFit: 'fill',
      marginRight: 8
    }
  },
  defaultAttrs: {
    padding: [8, 12, 8, 12]
  }
}
