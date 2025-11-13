import { defineDeckComponent } from '../../defineDeckComponent'

export default defineDeckComponent({
  key: 'user-agreement-page',
  name: '用户协议',
  version: '0.1.0',
  thumbnail: '',
  images: [],
  type: 'page',
  render: () => import('./render')
})
