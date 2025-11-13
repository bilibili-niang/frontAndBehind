import { defineSchema } from '../utils/schema'

export default defineSchema({
  type: 'object',
  title: '边框',
  widget: 'suite',
  enableKey: 'enable',
  enableKeyAsProperty: true,
  properties: {
    shape: {
      type: 'string',
      title: '线型',
      widget: 'select',
      config: {
        options: [
          { value: 'solid', label: '实线' },
          { value: 'dashed', label: '虚线' },
          { value: 'dotted', label: '点线' }
        ],
        flex: 12
      }
    },
    width: {
      type: 'number',
      title: '粗细',
      config: {
        suffix: 'px',
        flex: 12
      }
    },
    color: {
      type: 'string',
      title: '颜色',
      widget: 'color',
      config: {
        flex: 24
      }
    }
  },
  default: {
    enable: false,
    shape: 'solid',
    width: 1,
    color: '#ffffff'
  }
})
