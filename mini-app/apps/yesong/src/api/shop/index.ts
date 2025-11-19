import request, { PaginationData, RequestPagination } from '../request'

export interface ShopItem {
  /**
   * 地址
   */
  address?: string
  /**
   * 打样时间
   */
  closingAt?: string
  /**
   * 联系人
   */
  contactInfo?: {
    /**
     * 联系人姓名
     */
    contactName: string
    /**
     * 联系人电话
     */
    contactPhone: string
  }[]
  /**
   * 距离，单位：米
   */
  distance?: string
  /**
   * 门店ID
   */
  id: string
  /**
   * 纬度
   */
  latitude?: string
  /**
   * 坐标经纬度
   */
  location?: {
    lat: number
    lng: number
  }
  /**
   * 经度
   */
  longitude?: string
  /**
   * 门店名称
   */
  name?: string
  /**
   * 开始营业时间
   */
  openingAt?: string
  /**
   * 所在地区
   */
  region?: string
  /**
   * 状态
   */
  status?: number
  [property: string]: any
}

/** 获取商品适用门店列表 */
export const getGoodsSuitableShops = (
  params: RequestPagination<{
    goodsId: string
  }>
) => {
  return request<PaginationData<ShopItem>>({
    url: `/anteng-cornerstone-goods-wap/m/goods/${params.goodsId}/shop`,
    method: 'GET',
    withLocation: true,
    params
  })
}
