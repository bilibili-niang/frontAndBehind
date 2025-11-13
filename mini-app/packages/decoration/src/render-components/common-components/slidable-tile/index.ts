import { defineDecorationComponent } from '../../defineDecorationComponent'

export default defineDecorationComponent({
  key: 'slidable-tile',
  name: '动态瓷片区',
  version: '0.1.0',
  thumbnail: 'https://dev-cdn.null.cn/upload/b1e53f0572b34022d71b30b0ea33d179.gif',
  images: [],
  type: 'common',
  render: () => import('./render')
})
