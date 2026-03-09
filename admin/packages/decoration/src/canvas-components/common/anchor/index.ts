import { defineDeckComponent } from '../../defineDeckComponent'

export default defineDeckComponent({
  key: 'anchor',
  name: '电梯导航',
  version: '0.1.0',
  thumbnail: 'https://dev-cdn.dev-cdn.ice.cn/upload/322e4eeb458d8eadd4ae5315438e8927.png',
  images: [],
  type: 'common',
  render: () => import('./render')
})
