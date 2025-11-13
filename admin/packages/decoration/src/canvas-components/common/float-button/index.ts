import { defineDeckComponent } from '../../defineDeckComponent'

export default defineDeckComponent({
  key: 'float-button',
  name: '悬浮按钮',
  version: '0.1.0',
  thumbnail: 'https://dev-cdn.kacat.cn/upload/ca1e60dd7f83af653088a5a7d5ff624f.png',
  fixed: true,
  type: 'common',
  render: () => import('./render')
})
