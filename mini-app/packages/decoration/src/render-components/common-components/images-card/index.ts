import { defineDecorationComponent } from '../../defineDecorationComponent'

export default defineDecorationComponent({
  key: 'images-card',
  name: '图片',
  version: '0.1',
  type: 'common',
  thumbnail: 'http://222.77.126.187:8083/yeah-song/static/ScreenShot_2025-10-28_101815_442.png',
  // 不展示出来
  implicit: true,
  render: () => import('./render') as any
})