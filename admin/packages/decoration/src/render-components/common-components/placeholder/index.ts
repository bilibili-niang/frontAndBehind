import { defineDecorationComponent } from '../../defineDecorationComponent'

export default defineDecorationComponent({
  key: 'placeholder',
  name: '空白分隔',
  version: '0.1',
  thumbnail: '',
  images: [''],
  type: 'common',
  render: () => import('./render')
})
