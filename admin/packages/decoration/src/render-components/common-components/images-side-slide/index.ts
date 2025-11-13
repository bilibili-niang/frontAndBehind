import { defineDecorationComponent } from '../../defineDecorationComponent'

export default defineDecorationComponent({
  key: 'images-side-slide',
  name: '多图排列',
  version: '0.1',
  thumbnail: '',
  images: [],
  type: 'common',
  render: () => import('./render'),
  versionAdapter: (payload) => {
    payload.config?.data?.forEach((item: any) => {
      item.linearGradientEnable = item.linearGradientEnable ?? true
      item.linearGradient = item.linearGradient ?? { color: '#000', end: 40 }
    })
    return payload
  }
})
