import { request } from '@anteng/core'

/** 提交京东 */
export const $createJdOrder = (params: JdOrderParams) => {
  // // if (process.env.TARO_ENV === 'h5' && location.href.includes('jd-debug=true')) {
  // return Promise.resolve({
  //   code: 200,
  //   data: {
  //     orderNo: 'MO20250213101642205747',
  //     subOrderNos: ['SO20250213101642977979'],
  //     unifiedOrderNo: 'UO20250213101643452801'
  //   },
  //   msg: '操作成功',
  //   success: true
  // })
  // // }

  return request<{
    unifiedOrderNo: string
    orderNo: string
  }>({
    url: '/kuoka-microstore-hlgt-wap/m/jdjl/order',
    method: 'post',
    data: params
  })
}

interface JdOrderParams {
  /**
   * 订单运费，京东下单跳转传递
   */
  freight: string
  /**
   * 合作商 id
   */
  merchantId: string
  /**
   * 订单号，京东下单跳转传递
   */
  orderId: string
  /**
   * 签名，京东下单跳转传递
   */
  sign: string
  /**
   * 下单时间，Unix    时间戳，京东下单跳转传递
   */
  submitOrderTime: string
  /**
   * 订单总金额，京东下单跳转传递
   */
  totalMoney: string
  /**
   * 用户唯一标识，京东下单跳转传递
   */
  uid: string
}
