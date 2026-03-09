import { defineDeckComponent } from '../../defineDeckComponent'

export default defineDeckComponent({
  key: 'image-modal',
  name: '图片弹窗',
  version: '0.1.0',
  thumbnail: 'https://dev-cdn.dev-cdn.ice.cn/upload/d7914a048982dfc9167a049c451bc214.jpg',
  fixed: true,
  unordered: true,
  type: 'common',
  render: () => import('./render'),
  nestRelation: {
    allowedParents: {
      includes: [],
      excludes: ['*']
    },
    allowedChildren: {
      includes: [],
      excludes: ['*']
    }
  }
})
