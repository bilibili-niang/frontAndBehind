import { defineDeckComponent } from '../../defineDeckComponent'

export default defineDeckComponent({
  key: 'image',
  name: '图片',
  version: '0.1',
  thumbnail: '',
  type: 'common',
  render: () => import('./render')
})
