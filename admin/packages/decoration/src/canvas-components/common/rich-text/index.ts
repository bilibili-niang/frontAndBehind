import { defineDeckComponent } from '../../defineDeckComponent'

export default defineDeckComponent({
  key: 'rich-text',
  name: '图文',
  version: '0.1.0',
  thumbnail: 'https://dev-cdn.kacat.cn/upload/ded5abfd59046b0f3503c1c52ba351f0.png',
  images: [],
  type: 'common',
  render: () => import('./render')
})
