import { defineDeckComponent } from '../../defineDeckComponent'

export default defineDeckComponent({
  key: 'sub-title',
  name: '主标题组件',
  version: '0.1',
  thumbnail:
    'https://cdn2.weimob.com/saas/saas-fe-sirius-orion-node/production/168/gonggao.png?imageView2/2/w/380/q/90/interlace/1&v=123',
  type: 'common',
  render: () => import('./render')
})
