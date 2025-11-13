import useUserStore from '../../stores/user'
import type { RequestPagination } from '../request'
import request from '../request'

export const $getOpenAppCashierList = (params: RequestPagination<{}>) => {
  return request({
    url: '/null-cornerstone-open/open/page',
    method: 'get',
    params: {
      ...params
    }
  })
}

interface ICashierOptions {
  /** 应用名称 */
  appName: string
  /** 合作商 id */
  merchantId: string
  /** 三方订单支付确认完整api请求地址 */
  orderConfirmUrl?: string
  /** 三方订单详情页面完整url地址 */
  orderDetailUrl?: string
  /** 三方私钥 */
  privateKey?: string
  /** 三方公钥，如果三方公钥不为空，则说明是第三方提供的，也就无需生成三方私钥。*/
  publicKey?: string
  /** 三方商城完整页面url地址 */
  shoppingMallUrl?: string
  /** 请求三方超时时间(单位秒)，前端请求是String类型，由后端来判断如果不是整数则报错。 */
  timeout?: string
}

/** 创建收银台应用 */
export const $createOpenAppCashier = (options: ICashierOptions) => {
  return request({
    url: '/null-cornerstone-open/open',
    method: 'post',
    data: {
      ...options
    }
  })
}

/** 更新收银台应用 */
export const $updateOpenAppCashier = (id: string, data: ICashierOptions) => {
  return request({
    url: `/null-cornerstone-open/open/${id}`,
    method: 'put',
    data: {
      ...data
    }
  })
}

/** 获取收银台应用详情 */
export const $getOpenAppCashierDetail = (id: string) => {
  return request({
    url: `/null-cornerstone-open/open/${id}`,
    method: 'get'
  })
}

/** 获取第三方商城链接 */
export const $getOpenAppCashierMallURL = (appId: string) => {
  return request({
    url: `/null-cornerstone-open/open/getShoppingMallUrl/${appId}`
  })
}
