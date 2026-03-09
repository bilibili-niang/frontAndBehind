import { defineDeckComponent } from '../../defineDeckComponent'

export default defineDeckComponent({
  key: 'image',
  name: '图片',
  version: '0.1.0',
  thumbnail: 'https://dev-cdn.dev-cdn.ice.cn/upload/20240625/b0e653bbf753d2d5091124f19beb3ec9.png',
  type: 'common',
  render: () => import('./render')
})
