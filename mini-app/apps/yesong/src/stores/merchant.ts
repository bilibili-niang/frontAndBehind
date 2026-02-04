import { defineStore } from 'pinia'
import { computed, readonly, ref } from 'vue'
import { IMerchantOrderFlow, requestGetMerchantOrderFlow } from '../api/merchant'
import { useAppStore } from '@pkg/core'
import { getMerchantId } from '../api'
import dayjs from 'dayjs'
import { PAYMENT_END_UNIT_DAY, PAYMENT_END_UNIT_HOUR, PAYMENT_END_UNIT_MINUTE } from '../constants'
import useSystemPageStore from './system-page'

const useMerchantStore = defineStore('merchant', () => {
  const appStore = useAppStore()

  const merchantId = ref<string | null>(null)

  const initMerchant = (id: string) => {
    console.log('初始化商户模块：', id)
    appStore.merchantId = id
    merchantId.value = id
    getMerchantOrderFlow()
    useSystemPageStore().checkSystemPagesVersion()
  }

  const getMerchantIdError = ref(false)
  const getMerchantInfo = async () => {
    getMerchantIdError.value = false
    if (process.env.TARO_ENV === 'weapp') {
      // 尝试从环境变量中获取
      try {
        const m = process.env.TARO_APP_MERCHANT_ID!
        if (m) {
          initMerchant(m)
          return Promise.resolve(merchantId.value)
        }
      } catch (err) {
        //
      }

      const appId = appStore.accountInfo!.miniProgram.appId
      // 开发小程序 | 小鹭岛
      if (
        (process.env.NODE_ENV === 'development' && appId === 'wxa579140afcfc9721') ||
        appId === 'wx05fa8c4202336762'
      ) {
        initMerchant('1717732945099657218')
        return Promise.resolve(merchantId.value)
      } else if (process.env.NODE_ENV === 'development' && appId === 'wxa8d97f27239a52c6') {
        initMerchant('1716391940072464386')
        return Promise.resolve(merchantId.value)
      } else {
        try {
          const res = await getMerchantId(appId)
          if (res.code === 200 && res.data !== 0) {
            initMerchant(res.data)
            return Promise.resolve(merchantId.value)
          } else {
            getMerchantIdError.value = true
            console.error('获取商户 id 失败：', res)
            return Promise.reject(merchantId.value)
          }
        } catch (err) {
          getMerchantIdError.value = true
          console.error('获取商户 id 失败：', err)
          return Promise.reject(merchantId.value)
        }
      }
    } else if (process.env.TARO_ENV === 'h5') {
      initMerchant((window as any).location.href.match(/m=(-?)\d+/)?.[0]?.replace('m=', '') || '1714899756496248834')
      return Promise.resolve(merchantId.value)
    }
  }

  const merchantOrderFlow = ref<IMerchantOrderFlow | null>(null)
  const getMerchantOrderFlow = async () => {
    try {
      const res = await requestGetMerchantOrderFlow()
      if (res.code === 200) {
        merchantOrderFlow.value = res.data
      } else {
        console.error('获取商户订单流程配置失败：', res)
      }
    } catch (err) {
      console.error('获取商户订单流程配置失败：', err)
    }
  }

  const reasonOptions = computed(
    () =>
      merchantOrderFlow.value?.reason ?? [
        '买多／买错／不喜欢／不想要了',
        '商品破损／包装问题',
        '商品质量问题',
        '商品与页面描述不符合',
        '发错货',
        '少件／漏发／少赠品',
        '发货时间问题',
        '快递／物流一直未收到',
        '快递／物流无跟踪记录'
      ]
  )

  /** 计算订单付款截止时间，传入订单创建时间 */
  const calcPaymentEndTime = (createTime: string) => {
    const unit = merchantOrderFlow.value?.units ?? PAYMENT_END_UNIT_HOUR
    const num = merchantOrderFlow.value?.closeTime ?? 2
    const unitType =
      unit === PAYMENT_END_UNIT_HOUR
        ? 'h'
        : unit === PAYMENT_END_UNIT_MINUTE
        ? 'm'
        : unit === PAYMENT_END_UNIT_DAY
        ? 'd'
        : 'h'
    return dayjs(createTime).add(num, unitType).format('YYYY-MM-DD HH:mm:ss')
  }
  // 获取商户id的初始化存在延迟,任何文件导入 useMerchantStore 就会执行下面的判断
  if (!merchantId.value) {
    getMerchantInfo().then()
  }

  return {
    getMerchantInfo,
    getMerchantIdError,
    merchantId: readonly(merchantId),
    initMerchant,
    merchantOrderFlow,
    getMerchantOrderFlow,
    reasonOptions,
    calcPaymentEndTime
  }
})

export default useMerchantStore
