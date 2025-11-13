import { defineDeckComponent } from '../../defineDeckComponent'

export default defineDeckComponent({
  key: 'login-page',
  name: '登录页',
  version: '0.1.0',
  thumbnail: '',
  images: [],
  type: 'page',
  render: () => import('./render')
})
