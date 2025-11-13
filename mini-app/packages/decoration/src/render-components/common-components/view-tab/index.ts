import { defineDecorationComponent } from '../../defineDecorationComponent'

export default defineDecorationComponent({
  key: 'view-tab',
  name: '分页切换',
  version: '0.1.0',
  thumbnail: 'https://dev-cdn.null.cn/upload/322e4eeb458d8eadd4ae5315438e8927.png',
  images: [],
  type: 'common',
  render: () => import('./render'),
  nestRelation: {
    allowedChildren: {
      includes: ['view-tab-container']
    }
  }
})
