import request from '../request'
import { IExpressInfo } from './types'

export type { IExpressInfo } from './types'

/** 获取物流信息 */
export const getExpressInfo = (params: { courierNo: string; phone: string }) => {
  return request<IExpressInfo>({
    url: '/anteng-cornerstone-order-wap/m/goods/order/logistics',
    method: 'get',
    params: {
      courierNo: params.courierNo,
      mobile: params.phone
    }
  })
}
