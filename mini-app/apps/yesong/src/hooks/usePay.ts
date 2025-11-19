import Taro from '@tarojs/taro'
import { getPayParams } from '../../api'
import {
  useAppStore,
  useLoading,
  useLoadingEnd,
  useResponseMessage,
  useToast,
  withWechatBind,
  useOpenWeapp
} from '@anteng/core'

/** 唤起支付，注意：此处 orderNo 为统一订单单号！ */
export const usePay = (
  orderNo: string,
  options?: {
    success?: () => void
    fail?: (errMsg: string) => void
    complete?: () => void
    payResultPath?: string
  }
) => {
  useLoading()
  getPayParams(orderNo)
    .then(res => {
      console.log(res)
      if (res.code === 200) {
        if (res.data?.allinpayInfo) {
          // if (res.data?.cqpMpAppId && res.data?.cqpMpPath) {
          navigateToUnionPay(res.data.allinpayInfo, options)
          return void 0
        }

        if (!res.data.wechatPayInfo) {
          // 没有支付信息(无需微信支付) = 支付成功
          options?.success?.()
          options?.complete?.()
          return void 0
        }
        const { nonce_str, package: p, pay_sign, sign_type, time_stamp } = res.data.wechatPayInfo

        if (process.env.TARO_ENV === 'h5') {
          useToast('H5暂不支持支付，请在小程序完成支付')
          useOpenWeapp({
            appId: useAppStore().appId!,
            path: options?.payResultPath,
            title: '打开小程序',
            appName: ''
          })
          return void 0
        }

        const wechatPay =
          process.env.TARO_APP_NO_WECHAT_PAY === 'true'
            ? () => {
                useToast('无法使用微信支付')
                options?.fail?.('无法使用微信支付')
                options?.complete?.()
              }
            : () => {
                Taro.requestPayment({
                  timeStamp: time_stamp,
                  nonceStr: nonce_str,
                  package: p,
                  signType: sign_type,
                  paySign: pay_sign
                })
                  .then(res => {
                    useResponseMessage(res)
                    options?.success?.()
                    options?.complete?.()
                  })
                  .catch(err => {
                    console.log(err)
                    options?.fail?.(err.errMsg)
                    options?.complete?.()
                  })
              }

        withWechatBind(wechatPay)() // 立即执行函数
      } else {
        useResponseMessage(res)
        throw new Error(res.msg)
      }
    })
    .catch(err => {
      useResponseMessage(err)
      options?.fail?.(err.response?.data.msg ?? err.message)
      options?.complete?.()
    })
    .finally(() => {
      useLoadingEnd()
    })
}

/** 跳转到云闪付小程序付款 */
const navigateToUnionPay = (
  params: { cqpMpAppId: string; cqpMpPath: string },
  options: Parameters<typeof usePay>[1]
) => {
  if (process.env.TARO_ENV === 'h5') {
    useOpenWeapp({
      appId: params.cqpMpAppId,
      path: params.cqpMpPath,
      appName: '云闪付',
      appLogo: 'https://dev-cdn.anteng.cn/upload/e248d3a7a6a15c0e311afebd647275a8.svg',
      success: () => {
        options?.success?.()
      },
      fail: err => {
        options?.fail?.(err?.errMsg)
      },
      complete: () => {
        options?.complete?.()
      }
    })
  } else {
    Taro.navigateToMiniProgram({
      appId: params.cqpMpAppId,
      path: params.cqpMpPath,
      envVersion: 'release'
    })
      .then(res => {
        useResponseMessage(res)
        options?.success?.()
      })
      .catch(err => {
        console.log(err)
        options?.fail?.(err.errMsg)
      })
      .finally(() => {
        options?.complete?.()
      })
  }
}

export default usePay
