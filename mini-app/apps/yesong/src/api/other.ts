import { request } from '@pkg/core'

/**
 * 获取京东链接（需登录）
 * type 0：商城（默认）
 * type 1：订单列表
 */
export const $getJdURL = (type: 0 | 1 = 0) => {
  return request({
    url: '/kuoka-microstore-hlgt-wap/m/jdjl/authLogin',
    method: 'get',
    params: {
      type
    }
  })
}

/** 获取京东锦礼订单详情 */
export const $getJdOrderDetail = (orderNo: string) => {
  return request({
    url: '/kuoka-microstore-hlgt-wap/m/jdjl/detail',
    method: 'get',
    withMerchantId: true,
    params: {
      orderNo
    }
  }).then(res => {
    if (res.data?.amount) {
      res.data.payAmountText = res.data.payAmountText || (res.data.amount / 100).toFixed(2)
    }
    return res
  })
}
