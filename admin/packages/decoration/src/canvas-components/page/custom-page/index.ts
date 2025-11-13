import { defineDeckComponent } from '../../defineDeckComponent'

export default defineDeckComponent({
  key: 'custom-page',
  name: '自定义页面',
  version: '0.1.0',
  thumbnail: '',
  images: [],
  type: 'page',
  render: () => import('./render')
})
