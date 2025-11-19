interface ReturnAddress {
  name: string
  phone: string
  address: string
}

export interface IMerchantOrderFlow {
  /** 售后次数 */
  afterSales: number
  /** 自动收货时间 */
  automaticReceipt: number
  /** 订单关闭时间 */
  closeTime: number
  /** 订单完成时间 */
  complete: number
  /** 订单创建时间 */
  createTime: string
  /** 创建用户ID */
  createUser: string
  /** 订单ID */
  id: string
  /** 是否已删除 */
  isDeleted: number
  /** 商户ID */
  merchantId: string
  /** 退货原因 */
  reason: string[]
  /** 退货地址 */
  returnAddress: ReturnAddress[]
  /** 租户ID */
  tenantId: string
  /** 订单关闭时间单位 */
  units: number
  /** 订单更新时间 */
  updateTime: string
  /** 更新用户ID */
  updateUser: string
  /** 主支付方式 */
  payChannel: string
  /** 副支付方式 */
  paySubChannel: string
}

/** 请求获取商户订单流程配置 */
export const requestGetMerchantOrderFlow = () => {
  return new Promise((resolve, reject) => {
    resolve({
      code: 200,
      data: {
        afterSales: 1,
        automaticReceipt: 7,
        closeTime: 2,
        complete: 7,
        createTime: '2021-09-01 00:00:00',
        createUser: '1',
        id: '1',
        isDeleted: 0,
        merchantId: '1',
        reason: ['买多／买错／不喜欢／不想要了', '商品破损／包装问题', '商品质量问题', '商品与页面描述不符合']
      }
    })
  })
}
