import { PaymentScene } from '@anteng/uiconfig'
import request from '../../api/request'

/** 获取收款账户配置 */
export const $getPayeeConfig = (params: { productCode?: string; payScene?: PaymentScene }) => {
  return request({
    url: '/null-cornerstone-merchant/receiving-account/config',
    method: 'get',
    params: {
      productCode: params?.productCode || import.meta.env.VITE_APP_SCENE,
      payScene: params.payScene ?? PaymentScene.Weapp
    }
  })
}

/** 更新收款账户配置 */
export const $updatePayeeConfig = (data: Options) => {
  return request({
    url: '/null-cornerstone-merchant/receiving-account/config',
    method: 'post',
    data: {
      ...data,
      productCode: data.productCode || import.meta.env.VITE_APP_SCENE,
      payScene: data.payScene ?? PaymentScene.Weapp
    }
  })
}

/**
 * 合作商应用收款账户配置
 */
interface Options {
  productCode?: string
  payScene?: PaymentScene
  /**
   * 多账户收款规则
   */
  multipleRule: MultipleRule[]

  /**
   * 收款类型
   */
  receivingType: number
  /**
   * 储值卡支付
   */
  storeValueCard: number
  /**
   * 统一收款规则
   */
  unifiedRule: UnifiedRule[]
}

interface MultipleRule {
  active?: number
  receivingAccountId?: string
  rule?: Rule
}

interface Rule {
  entitiesId: string[]
}

interface UnifiedRule {
  active?: number
  receivingAccountId?: string
}

// 构建虚假请求
export const $fakeRequest = (params: any) => {
  return new Promise((resolve, reject) => {
    return resolve({
      code: 1,
      data: {},
      success: true
    })
  })
}
