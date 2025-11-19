import request, { getMerchantId } from '../request'

/** 获取购物车信息 */
export const getCartInfo = () => {
  return request({
    url: '/anteng-cornerstone-goods-wap/m/shoppingCart',
    method: 'get',
    params: {
      merchantId: getMerchantId()
    }
  })
}

export interface ICartItemParams {
  goodsId: string
  goodsSkuId: string
  count: number
}
/** 添加商品到购物车 */
export const addGoodsToCart = (params: ICartItemParams) => {
  return request({
    url: '/anteng-cornerstone-goods-wap/m/shoppingCart',
    method: 'post',
    params: {
      merchantId: getMerchantId()
    },
    data: params
  })
}

/** 更新购物车项 */
export const updateCartItem = (id: string, params: ICartItemParams) => {
  return request({
    url: '/anteng-cornerstone-goods-wap/m/shoppingCart',
    method: 'put',
    params: {
      merchantId: getMerchantId()
    },
    data: {
      id,
      ...params
    }
  })
}

/** 删除购物车项 */
export const removeCartItem = (cartItemIds: string[]) => {
  return request({
    url: '/anteng-cornerstone-goods-wap/m/shoppingCart/items',
    method: 'delete',
    params: {
      merchantId: getMerchantId()
    },
    data: cartItemIds
  })
}
