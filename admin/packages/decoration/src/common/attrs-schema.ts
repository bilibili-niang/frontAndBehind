import { PRESET_SCHEMA } from '@pkg/jsf'

// 与编辑侧 attrs 配置保持一致：圆角/内外边距为数组，背景支持开关
const commonAttrsSchema = {
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
      config: { min: 0, max: 100, step: 1, suffix: '%' },
      default: 100
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
} as const

export default commonAttrsSchema as any