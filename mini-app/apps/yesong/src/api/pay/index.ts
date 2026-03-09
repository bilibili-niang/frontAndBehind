import { useAppStore } from '@pkg/core'
import request from '../request'

export const getPayParams = (orderNo: string) => {
  return request({
    // url: `/ice-cornerstone-order-wap/m/unifiedOrder/${orderNo}/payInfo`,
    url: `/ice-cornerstone-order-wap/m/unifiedOrder/${orderNo}/payInfoNew`,
    method: 'get',
    withMerchantId: true,
    params: {
      appid: useAppStore().appId
    }
  })
}
