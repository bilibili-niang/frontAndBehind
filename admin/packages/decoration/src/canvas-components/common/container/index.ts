import { defineDeckComponent } from '../../defineDeckComponent'

export default defineDeckComponent({
  key: 'container',
  name: '基础容器',
  version: '0.1.0',
  thumbnail: 'https://dev-cdn.dev-cdn.ice.cn/upload/6d74c6c866ad93dab94a9c27ed394ae0.png',
  type: 'common',
  render: () => import('./render'),
  bubbleHidden: true,
  nestRelation: {
    allowedParents: {
      excludes: ['*'],
      includes: []
    },
    allowedChildren: {
      includes: ['*'],
      excludes: []
    }
  }
})
