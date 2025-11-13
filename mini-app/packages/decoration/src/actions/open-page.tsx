import { defineAction } from '@anteng/core'
import PagesSelector from '../widget/pagesSelector'

export default defineAction({
  key: 'open-page',
  title: '跳转指定页面',
  icon: 'iphone',
  schema: {
    type: 'object',
    properties: {
      target: { title: '选择页面', type: 'object', widget: PagesSelector }
    }
  },
  default: {
    target: undefined
  }
})