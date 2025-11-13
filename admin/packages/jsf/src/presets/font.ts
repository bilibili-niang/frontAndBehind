import { defineSchema } from '../utils/schema'

export default defineSchema({
  title: '文本样式',
  type: 'object',
  widget: 'suite',
  properties: {
    color: {
      title: '颜色',
      type: 'string',
      widget: 'color',
      config: {
        flex: 24
      }
    },
    fontFamily: {
      title: '字体',
      type: 'string',
      widget: 'select',
      config: {
        flex: 12,
        options: [
          { value: '', label: '默认' }
          // { value: 'Microsoft Yahei', label: '微软雅黑' },
          // { value: '-apple-system, PingFang', label: '苹方' }
        ]
      }
    },
    fontSize: {
      title: '字号',
      type: 'number',
      config: {
        suffix: 'px',
        flex: 12,
        min: 0,
        max: 1000
      }
    },
    fontWeight: {
      title: '字体粗细',
      type: 'string',
      widget: 'select',
      config: {
        flex: 12,
        options: [
          { value: 'normal', label: '默认' },
          { value: 'bold' },
          { value: 'bolder' },
          { value: 'lighter' },
          { value: '300' },
          { value: '400' },
          { value: '500' },
          { value: '600' },
          { value: '700' },
          { value: '800' },
          { value: '900' }
        ]
      }
    },
    textAlign: {
      title: '水平对齐',
      type: 'string',
      widget: 'select',
      config: {
        flex: 12,
        options: [
          { value: 'left', label: '左对齐' },
          { value: 'center', label: '水平居中' },
          { value: 'right', label: '右对齐' }
        ]
      }
    },
    lineHeight: {
      title: '行高',
      type: 'number',
      config: {
        flex: 12,
        suffix: 'px',
        placeholder: '自动'
      }
    },
    letterSpacing: {
      title: '字间距',
      type: 'number',
      config: {
        flex: 12,
        suffix: 'px',
        min: -100,
        max: 100,
        placeholder: '正常'
      }
    }
  },
  default: {
    fontFamily: '',
    fontSize: 16,
    lineHeight: null,
    fontWeight: 'normal',
    color: '#000000',
    letterSpacing: null,
    textAlign: 'left'
  }
})
