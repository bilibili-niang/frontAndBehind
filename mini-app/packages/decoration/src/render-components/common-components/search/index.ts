import { defineDecorationComponent } from '../../defineDecorationComponent'

export default defineDecorationComponent({
  key: 'search',
  name: '搜索',
  version: '0.1.0',
  thumbnail:
    'https://cdn2.weimob.com/saas/saas-fe-sirius-orion-node/production/168/sousuo.png?imageView2/2/w/380/q/90/interlace/1&v=123',
  type: 'common',
  render: () => import('./render')
})
