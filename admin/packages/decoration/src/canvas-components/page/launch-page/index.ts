import { defineDeckComponent } from '../../defineDeckComponent'

export default defineDeckComponent({
  key: 'launch-page',
  name: '启动页',
  version: '0.1.0',
  thumbnail: '',
  images: [],
  type: 'page',
  render: () => import('./render')
})
