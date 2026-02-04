import { PRESET_SCHEMA } from '@pkg/jsf'

export default {
  key: 'container',
  name: '基础容器',
  version: '0.1.0',
  thumbnail: 'https://dev-cdn.kacat.cn/upload/20231025/dcda0ff682fe16282f187706dc9bb8b3.gif',
  schema: {
    type: 'object',
    properties: {
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
          fromStop: {
            title: '起始位置',
            type: 'number',
            widget: 'slider',
            config: {
              min: 0,
              max: 100,
              suffix: '%'
            }
          },
          to: {
            title: '结束颜色',
            type: 'string',
            widget: 'color'
          },
          toStop: {
            title: '结束位置',
            type: 'number',
            widget: 'slider',
            config: {
              min: 0,
              max: 100,
              suffix: '%'
            }
          }
        }
      },
      border: PRESET_SCHEMA.BORDER
    }
  },
  default: {
    linearGradientEnable: false,
    linearGradient: {
      deg: 180,
      from: 'rgba(94, 144, 251, 0.1)',
      to: '#ffffff',
      fromStop: 0,
      toStop: 100
    },
    border: PRESET_SCHEMA.BORDER.default
  }
}
