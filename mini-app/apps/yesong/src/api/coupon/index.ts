import request from '../request'
import { PaginationData } from '@pkg/core'
import { ICouponAuditRecord } from './types'

/**
 * 获取卡券商品列表
 */
export const getCouponList = (params: any) => {
  return request({
    url: '/anteng-cornerstone-order-wap/m/couponRecord/list',
    method: 'get',
    withMerchantId: true,
    params
  })
}

/** 用户侧自主核销<静态码>卡券 */
export const $postAuditStaticCoupon = (options: {
  /** 卡券密码（仅qrcode_type=2时须填写）*/
  password?: string
  /** 发券记录流水号（卡券核销数据确认接口返回参数）*/
  recordNo?: string
  /** 门店ID */
  storeId: string
  /** 门店名称 */
  storeName: string
  /** 卡券订单号 */
  orderNo: string
  /** 核销数量 */
  number: number
}) => {
  return request({
    url: '/anteng-cornerstone-order-wap/m/goods/coupon/verification',
    method: 'post',
    withMerchantId: true,
    data: options
  })
}

/** 用户侧自主核销<动态码>卡券 */
export const $postAuditDynamicCoupon = (options: {
  /** 卡券密码（仅qrcode_type=2时须填写）*/
  password?: string
  /** 动态核销码 */
  verificationCode: string
  /** 门店ID */
  storeId: string
  /** 门店名称 */
  storeName: string
  /** 核销数量 */
  number: number
}) => {
  return request({
    url: '/anteng-cornerstone-order-wap/m/goods/coupon/dynamic-verification',
    method: 'post',
    withMerchantId: true,
    data: options
  })
}

/** 获取子订单下的卡券核销记录 */
export const $getCouponAuditRecords = (orderNo: string) => {
  return request<PaginationData<ICouponAuditRecord>>({
    url: `/anteng-cornerstone-order-wap/m/goods/coupon/verification-record/${orderNo}`,
    method: 'get',
    withMerchantId: true
  })
}
