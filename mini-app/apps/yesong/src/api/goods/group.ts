import { PaginationData, RequestPagination } from '@pkg/core'
import request from '../request'

export interface IGoodsGroup {
  /**
   * 装修数据
   */
  decorate: { [key: string]: any }
  /**
   * 商品分组id
   */
  id: string
  /**
   * 商品分组名称
   */
  name: string
}

/** 获取商品分组详情 */
export const requestGetGoodsGroupDetail = (id: string) => {
  return request<IGoodsGroup>({
    url: `/ice-cornerstone-goods-wap/m/group/${id}`,
    method: 'get'
  })
}

export interface IGroupGoods {
  /** 商品编码 */
  code: string
  /** 封面图 */
  coverImages: string[]
  /** 商品ID */
  id: string
  /** 商品最高价 */
  priceMax: string
  /** 商品最低价 */
  priceMin: string
  /** 排序号 */
  sort: number
  /** 状态 */
  status: number
  /** 商品名称 */
  title: string
  /** 商品类型 */
  type: number
  /** 划线价 */
  underlinePrice: string
}

/**
 * 获取分组商品列表
 * @param params.groupId - 分组ID
 */
export const requestGetGroupGoods = (
  params: RequestPagination<{
    groupId: string
  }>
) => {
  const { groupId, ...restParams } = params
  return request<PaginationData<IGroupGoods>>({
    url: `/ice-cornerstone-goods-wap/m/goods/group/${groupId}`,
    method: 'get',
    params: restParams
  })
}
