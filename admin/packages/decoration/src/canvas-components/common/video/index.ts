import { defineDeckComponent } from '../../defineDeckComponent'

export default defineDeckComponent({
  key: 'video',
  name: '视频',
  version: '0.1.0',
  thumbnail: 'https://dev-cdn.dev-cdn.ice.cn/upload/20240625/2a94a1f7757514921ba252c229f1603d.png',
  type: 'common',
  render: () => import('./render')
})
