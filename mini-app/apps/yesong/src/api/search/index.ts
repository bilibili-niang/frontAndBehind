import request from '../request'
import { PaginationData, RequestPagination } from '@pkg/core'

interface ISearchResult {
  code: string
  coverImages: string[]
  id: string
  priceMax: string
  priceMin: string
  sort: number
  status: number
  title: string
  type: number
  underlinePrice: string
}

/** 搜索商品 */
export const requestGetSearchResults = (
  params: RequestPagination<{
    keywords?: string
  }>
) => {
  return request<PaginationData<ISearchResult>>({
    url: '/anteng-cornerstone-goods-wap/m/goods/search',
    method: 'get',
    withMerchantId: true,
    params: {
      ...params,
      keyword: params.keywords ?? ''
    }
  })
}
// 商品列表接口
export const $getGoodsList = (
  params: RequestPagination<{
    categoryId?: string
    keywords?: string
  }>
) => {
  return request<PaginationData<ISearchResult>>({
    url: '/anteng-cornerstone-goods-wap/m/goods',
    method: 'get',
    withMerchantId: true,
    params
  })
}
// 另一个商品搜索接口,只是传参方式不同
export const $getGoodsBySearchParams = params => {
  return request({
    url: '/anteng-cornerstone-goods-wap/m/goods/search',
    method: 'get',
    withMerchantId: true,
    params
  })
}
