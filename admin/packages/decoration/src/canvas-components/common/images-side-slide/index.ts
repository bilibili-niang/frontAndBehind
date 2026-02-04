import { defineDeckComponent } from '@pkg/decoration'

export default defineDeckComponent({
  key: 'images-side-slide',
  name: '多图排列',
  version: '0.1.0',
  thumbnail: 'https://dev-cdn.kacat.cn/upload/20240625/779aae9df05e787883e3da34de130409.png',
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
