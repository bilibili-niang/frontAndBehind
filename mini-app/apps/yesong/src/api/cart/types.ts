import { IGoodsDetail } from '../goods/types'

/** 购物车子项 */
export interface ICartItem {
  /** 添加的数量 */
  count: number
  /** 商品信息 */
  goods: IGoodsDetail
  /** 商品id */
  goodsId: string
  /** 选择的商品skuId */
  goodsSkuId: string
  /** 购物车项id */
  id: string
  /** 加入时间 */
  joinTime: string
  [property: string]: any
}
