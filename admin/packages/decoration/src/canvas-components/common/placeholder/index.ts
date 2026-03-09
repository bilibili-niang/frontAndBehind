import { defineDeckComponent } from '../../defineDeckComponent'

export default defineDeckComponent({
  key: 'placeholder',
  name: '空白分隔',
  version: '0.1.0',
  thumbnail: 'https://dev-cdn.dev-cdn.ice.cn/upload/20231122/7eafb55b1061d13437f6ed2ed8205a0b.png',
  images: ['https://image-c-dev.weimobwmc.com/qa-saas-wxbiz/d093bad4b7e8497e8f068e00827fe2fe.gif'],
  type: 'common',
  render: () => import('./render')
})
