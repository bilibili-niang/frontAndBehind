import { defineSchema } from '../utils/schema'

export default defineSchema({
  type: 'array',
  title: '圆角',
  widget: 'border-radius',
  items: [
    { type: 'number', title: '左上角', default: 0 },
    { type: 'number', title: '右上角', default: 0 },
    { type: 'number', title: '右下角', default: 0 },
    { type: 'number', title: '左下角', default: 0 }
  ],
  default: [0, 0, 0, 0]
})
