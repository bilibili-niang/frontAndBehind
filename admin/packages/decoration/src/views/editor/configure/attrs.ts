import { PRESET_SCHEMA } from '@pkg/jsf'

export default {
  schema: {
    title: '组件通用属性',
    type: 'object',
    properties: {
      background: {
        title: '背景填充',
        type: 'string',
        widget: 'color',
        enableKey: 'backgroundEnable'
      },
      opacity: {
        title: '不透明度',
        type: 'number',
        widget: 'slider',
        config: {
          min: 0,
          max: 100,
          suffix: '%'
        }
      },
      borderRadius: PRESET_SCHEMA.BORDER_RADIUS,
      // border: PRESET_SCHEMA.BORDER,
      padding: {
        title: '内边距',
        type: 'array',
        widget: 'padding'
      },
      margin: {
        title: '外边距',
        type: 'array',
        widget: 'padding'
      },
      overflow: {
        title: '超出区域',
        type: 'string',
        widget: 'select',
        config: {
          options: [
            { label: '显示', value: 'visible' },
            { label: '隐藏', value: 'hidden' }
          ]
        }
      }
    }
  },
  default: {
    backgroundEnable: false,
    background: 'rgba(255, 255, 255, 0)',
    borderRadius: [0, 0, 0, 0],
    border: {
      enable: false,
      shape: 'solid',
      width: 1,
      color: '#000000'
    },
    opacity: 100,
    padding: [0, 10, 0, 10],
    margin: [10, 0, 10, 0]
  }
}
