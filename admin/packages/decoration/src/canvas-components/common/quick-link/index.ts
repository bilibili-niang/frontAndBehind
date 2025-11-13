import { defineDeckComponent } from '../../defineDeckComponent'

export default defineDeckComponent({
  key: 'quick-link',
  name: '金刚区',
  version: '0.1.2',
  thumbnail:
    'https://cdn2.weimob.com/saas/saas-fe-sirius-orion-node/production/168/tuwendaohang.png?imageView2/2/w/380/q/90/interlace/1&v=123',
  type: 'common',
  render: () => import('./render')
})
