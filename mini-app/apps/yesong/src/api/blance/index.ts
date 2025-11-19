import { SCENE_STORE } from '@anteng/core'
import request from '../request'

/**
 * 余额接口
 */
export const getUserBalance = () => {
  return request({
    url: '/anteng-cornerstone-auth-wap/m/account/balance',
    method: 'get',
    withMerchantId: true,
    params: {
      scene: SCENE_STORE
    }
  })
}

/**
 * 获取账户明细
 */
export const getAccountLog = (params: any) => {
  return request({
    url: '/anteng-cornerstone-auth-wap/m/account/record/',
    method: 'get',
    withMerchantId: true,
    params
  })
}
