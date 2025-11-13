import { defineDecorationComponent } from '../../defineDecorationComponent'

export default defineDecorationComponent({
  key: 'image-modal',
  name: '图片弹窗',
  version: '0.1',
  thumbnail: '',
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
