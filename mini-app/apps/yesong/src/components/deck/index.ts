import goodsList from './goods-list'
import goodsGroup from './goods-group'
import multiLineGoods from './multiLineGoods'
import informationCard from './information-card'
import { registerDeckComponent } from '@pkg/deck'
import search from './search'
import goodsSwiper from './goods-swiper'

const comps = {
  // 业务组件
  search,
  'goods-list': goodsList,
  'goods-group': goodsGroup,
  'multi-line-goods': multiLineGoods,
  'information-card': informationCard,
  'goods-swiper': goodsSwiper
}
Object.keys(comps).forEach(key => {
  registerDeckComponent(key, comps[key])
})
