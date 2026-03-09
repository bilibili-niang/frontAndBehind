import { defineDeckComponent } from '../../defineDeckComponent'

export default defineDeckComponent({
  key: 'slidable-tile',
  name: '动态瓷片区',
  version: '0.1.0',
  thumbnail: 'https://dev-cdn.dev-cdn.ice.cn/upload/b1e53f0572b34022d71b30b0ea33d179.gif',
  images: [],
  type: 'common',
  render: () => import('./render')
})
