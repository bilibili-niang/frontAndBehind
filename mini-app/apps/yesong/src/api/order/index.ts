import { SCENE_STORE, useAppStore } from '@pkg/core'
import request, { PaginationData, type RequestPagination, getMerchantId } from '../request'
import { IAfterSaleOrder, IOrderDetail } from './types'
import { CancelTokenSource } from 'axios'
import { $getJdOrderDetail } from '../other'

export interface IGoodsOrderParams {
  /** 收货地址 */
  contactAddress?: string
  /** 收货城市 */
  contactCity?: string
  /** 收货区县 */
  contactDistrict?: string
  /** 联系人电话 */
  contactMobile?: string
  /** 联系人姓名 */
  contactName?: string
  /** 收货省份 */
  contactProvince?: string
  /** 商品下单数量 */
  count: number
  /** 商品ID */
  goodsId: string
  /** 商品SKU ID */
  goodsStockId: string
  /** 主支付方式 */
  payMethod: number
  /** 副支付方式 */
  subPayMethod: number
}

export const commitGoodsOrder = (params: IGoodsOrderParams) => {
  return request({
    url: '/anteng-cornerstone-order-wap/m/goods/order',
    method: 'post',
    withUtm: true,
    data: {
      ...params,
      scene: SCENE_STORE,
      appId: useAppStore().appId
    }
  })
}

export interface ICartGoodsOrderParams extends Omit<IGoodsOrderParams, 'goodsId' | 'goodsStockId' | 'count'> {
  /** 购物车子项 id */
  itemIds: string[]
}

// 提交购物车商品订单
export const commitCartGoodsOrder = (params: ICartGoodsOrderParams) => {
  return request({
    url: '/anteng-cornerstone-order-wap/m/shoppingCart/order',
    method: 'post',
    params: {
      merchantId: getMerchantId()
    },
    data: {
      ...params,
      scene: SCENE_STORE,
      appId: useAppStore().appId
    }
  })
}

export const getOrderList = (
  params: RequestPagination<{
    tabStatus?: any
  }>
) => {
  return request<PaginationData<any>>({
    url: '/anteng-cornerstone-order-wap/m/goods/order',
    method: 'get',
    params: {
      merchantId: getMerchantId(),
      descs: 'id',
      ...params,
      scene: SCENE_STORE
    }
  })
}

export const getGoodsOrderDetail = async (orderNo: string, supplier?: string) => {
  if (supplier === 'jd') {
    return $getJdOrderDetail(orderNo)
  }

  try {
    const res = await request<IOrderDetail>({
      url: `/anteng-cornerstone-order-wap/m/goods/order/${orderNo}`,
      method: 'get'
    })
    if (res.code === 200 && res.data?.subOrders) {
      res.data.subOrders = res.data.subOrders.map(item => {
        return {
          ...item,
          $payUnitAmount: item.payAmount / item.count,
          $payUnitAmountText: (Number(item.payAmountText) / item.count)?.toFixed(2)
        }
      })
    }
    return Promise.resolve(res)
  } catch (err) {
    return Promise.reject(err)
  }
}

/** 取消待支付订单 */
export const cancelPaymentPendingOrder = (id: string) => {
  return request({
    url: `/anteng-cornerstone-order-wap/m/goods/order/${id}/cancel`,
    method: 'put'
  })
}

/** 获取订单数量 */
export const requestGetOrderCounts = () => {
  return request({
    url: '/anteng-cornerstone-order-wap/m/goods/order/status/num',
    method: 'get',
    withMerchantId: true
  })
}

/** 确认收货 */
export const requestCompleteOrder = (id: string, platform: 'weapp' | 'h5') => {
  return request({
    url: `/anteng-cornerstone-order-wap/m/goods/order/${id}/complete`,
    params: {
      platform
    },
    method: 'put'
  })
}

export const requestSubmitAfterSale = (options: {
  amount: number
  count: number
  images?: string[]
  desc?: string
  mainOrderNo: string
  reason?: string
  subOrderNo: string
  type: number
}) => {
  const { amount, images, desc, mainOrderNo, reason, subOrderNo, type, count } = options
  return request({
    url: '/anteng-cornerstone-order-wap/m/afterSaleOrder/apply',
    method: 'post',
    withMerchantId: true,
    data: {
      amount,
      attachments: images,
      describe: desc,
      mainOrderNo,
      reason,
      subOrderNo,
      type,
      count
    }
  })
}

export const requestCancelAfterSale = (afterSaleOrderNo: string) => {
  return request({
    url: `/anteng-cornerstone-order-wap/m/afterSaleOrder/apply/${afterSaleOrderNo}`,
    withMerchantId: true,
    method: 'delete'
  })
}

export const $getAfterSaleOrders = (options: RequestPagination<{}>) => {
  return request<PaginationData<any>>({
    url: '/anteng-cornerstone-order-wap/m/afterSaleOrder',
    withMerchantId: true,
    method: 'get',
    params: options
  })
}

export const requestGetAfterSaleDetail = (afterSaleOrderNo: string) => {
  return request<IAfterSaleOrder>({
    url: `/anteng-cornerstone-order-wap/m/afterSaleOrder/${afterSaleOrderNo}`,
    method: 'get'
  })
}

export const requestUpdateAfterSaleExpress = (
  afterSaleOrderNo: string,
  options: {
    expressName: string
    expressNo: string
  }
) => {
  return request({
    url: `/anteng-cornerstone-order-wap/m/afterSaleOrder/${afterSaleOrderNo}/courier`,
    method: 'put',
    data: {
      courierName: options.expressName,
      courierNo: options.expressNo
    }
  })
}

/** 获取退款金额计算 */
export const $getRefundAmountCalculator = (
  /** 子订单编号 */
  orderNo: string,
  options: {
    /** 退款金额，单位 分 */
    amount: number
  },
  cancelToken?: CancelTokenSource
) => {
  return request({
    url: '/anteng-cornerstone-finance/refund/amount-calculate',
    method: 'get',
    params: {
      outOrderNo: orderNo,
      refundAmount: Math.round(options.amount)
    },
    cancelToken: cancelToken?.token
  })
}
