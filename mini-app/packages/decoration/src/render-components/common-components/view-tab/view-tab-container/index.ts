import { defineDeckComponent } from '../../../defineDeckComponent'

export default defineDeckComponent({
  key: 'view-tab-container',
  name: '分页容器',
  version: '0.1.0',
  thumbnail: '',
  images: [],
  type: 'common',
  implicit: true,
  render: () => import('./render'),
  nestRelation: {
    allowedChildren: {
      includes: ['*'],
      excludes: ['view-tab', 'view-tab-container']
    },
    allowedParents: {
      includes: ['view-tab']
    }
  }
})
