import { defineDeckComponent } from '../../defineDeckComponent'

export default defineDeckComponent({
  key: 'search-page',
  name: '搜索页',
  version: '0.1.0',
  thumbnail: '',
  images: [],
  type: 'page',
  render: () => import('./render')
})
