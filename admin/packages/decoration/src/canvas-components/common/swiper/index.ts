import { DeckComponent } from '../../../lib'
import { defineDeckComponent } from '../../defineDeckComponent'

export default defineDeckComponent({
  key: 'swiper',
  name: '轮播图',
  version: '0.1.1',
  thumbnail: 'https://dev-cdn.dev-cdn.ice.cn/upload/20240625/ebe17ce6a6e88de7e51d5aca59dd4eca.png',
  images: [],
  type: 'common',
  render: () => import('./render'),
  versionAdapter: (component: DeckComponent) => {
    // console.log('轮播图数据适配：', component)
    component.version = '0.1.1'
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
