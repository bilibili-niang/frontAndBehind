import { defineDeckComponent } from '../../defineDeckComponent'

export default defineDeckComponent({
  key: 'title',
  name: '标题',
  version: '0.1.0',
  thumbnail:
    'https://cdn2.weimob.com/saas/saas-fe-sirius-orion-node/production/168/biaoti.png?imageView2/2/w/380/q/90/interlace/1&v=123',
  images: [],
  type: 'common',
  render: () => import('./render')
})
