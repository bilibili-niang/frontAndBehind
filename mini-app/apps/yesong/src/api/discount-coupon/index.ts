import { COMMON_STATUS_OFF, COMMON_STATUS_ON } from '@anteng/config'
import request from '../request'
import { PaginationData, RequestPagination } from '@anteng/core'
import { IDiscountCoupon, IDiscountCouponRecord } from './types'
import { DiscountCouponScene } from '../../constants/discount-coupon'

/** 获取适用优惠券 */
export const $getDiscountCouponReceiveList = (
  params: RequestPagination<{
    goodsId?: string
    groupId?: string
    supplierId?: string
    showStatus?: boolean
  }>
) => {
  // 本地拦截：返回空列表，避免网络请求影响页面展示
  const current = params.current ?? 1
  const size = params.size ?? 100
  const pages = 0
  const total = 0
  return Promise.resolve({
    code: 200,
    success: true,
    msg: 'ok',
    data: {
      countId: '',
      current,
      maxLimit: 0,
      optimizeCountSql: true,
      orders: [],
      pages,
      records: [] as IDiscountCoupon[],
      searchCount: true,
      size,
      total
    } as PaginationData<IDiscountCoupon>
  })
}

/** 领取优惠券 */
export const $receiveDiscountCoupon = (params: {
  /** 优惠券id */
  couponId: string
  /** 领取场景 */
  couponScene: DiscountCouponScene
  /** 商品id */
  goodsId?: string
  /** 商品分组id */
  goodsGroupId?: string
}) => {
  return request({
    url: '/anteng-cornerstone-goods-wap/m/goods/coupon/receive',
    method: 'get',
    params,
    withMerchantId: true
  })
}

/** 获取我的优惠券列表 */
export const $getMyDiscountCouponList = (
  params: RequestPagination<{
    /** 筛选是否可用 */
    useable?: boolean
  }>
) => {
  const { useable, ...restParams } = params
  return request<PaginationData<IDiscountCouponRecord>>({
    url: '/anteng-cornerstone-goods-wap/m/goods/coupon/record',
    withMerchantId: true,
    params: {
      ...restParams,
      status: useable === true ? 0 : useable === false ? 1 : undefined
    }
  })
}

/** 获取我的优惠券数量 */
export const $getMyDiscountCouponCounts = () => {
  return request({
    url: '/anteng-cornerstone-goods-wap/m/goods/coupon/record/status/number',
    withMerchantId: true
  })
}

/** 获取订单可用优惠券列表 */
export const $getOrderUseableDiscountCouponList = (
  params: RequestPagination<{
    recordNo?: string
    items: {
      goodsId: string
      skuId: string
      count: number
    }[]
  }>
) => {
  const { recordNo, items, ...restParams } = params

  return request<PaginationData<IDiscountCouponRecord>>({
    url: '/anteng-cornerstone-goods-wap/m/goods/coupon/order/show',
    method: 'post',
    withMerchantId: true,
    data: {
      ...restParams,
      recordNo: params.recordNo,
      couponVerifyDTO: items.map(item => {
        return {
          goodsId: item.goodsId,
          goodsStockId: item.skuId,
          number: item.count
        }
      })
    }
  })
}

/** 获取已领取优惠券详情 */
export const $getDiscountCouponRecordDetail = (recordNo: string) => {
  return request<IDiscountCouponRecord>({
    url: '/anteng-cornerstone-goods-wap/m/goods/coupon/record/detail',
    method: 'get',
    withMerchantId: true,
    params: {
      recordNo
    }
  })
}

/** 获取优惠券适用商品 */
export const $getDiscountCouponUseableGoods = (
  params: RequestPagination<{
    recordNo?: string
    templateId?: string
  }>
) => {
  return request({
    url: '/anteng-cornerstone-goods-wap/m/goods/coupon/scope',
    method: 'get',
    withMerchantId: true,
    params
  })
}

/** 获取卡券模板详情 */
export const $getDiscountCouponTemplateDetail = (templateId: string) => {
  return request<IDiscountCoupon>({
    url: '/anteng-cornerstone-goods-wap/m/goods/coupon/detail',
    method: 'get',
    withMerchantId: true,
    params: {
      templateId
    }
  })
}
