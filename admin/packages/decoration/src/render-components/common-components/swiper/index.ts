import { DeckComponent } from '../../../lib'
import { defineDecorationComponent } from '../../defineDecorationComponent'

export default defineDecorationComponent({
  key: 'swiper',
  name: '轮播图',
  version: '0.1.1',
  thumbnail: 'https://dev-cdn.null.cn/upload/20240625/ebe17ce6a6e88de7e51d5aca59dd4eca.png',
  images: [],
  type: 'common',
  render: () => import('./render'),
  versionAdapter: (component: DeckComponent) => {
    // 0.1.0 -> 0.1.1
    component.config.images = component.config.images.map((item: any) => {
      if (item.image) {
        return item
      }
      return {
        image: item
      }
    })

    return component
  }
})
