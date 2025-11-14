import {
  BasePage,
  buildUrl,
  EmptyStatus,
  Spin,
  useAppStore,
  useLoading,
  useLoadingEnd,
  useResponseMessage,
  useToast,
  withLogin,
  usePay
} from '@anteng/core'
import { defineComponent, onMounted, reactive } from 'vue'
import './style.scss'
import url from 'url-parse'
import { nextTick, useRouter } from '@tarojs/taro'
import { $createJdOrder } from './api'
import { navigateToPayResult } from '../../router'

definePageConfig({
  defaultTitle: '京东收银台',
  navigationBarTitleText: '京东收银台',
  navigationStyle: 'custom'
})

export default defineComponent({
  name: 'JdCashier',
  setup() {
    const route = useRouter()

    const link = process.env.TARO_ENV === 'h5' ? url(decodeURIComponent(window.location.href), true) : { query: {} }

    const {
      uid = '',
      submitOrderTime = '',
      orderId = '',
      totalMoney = '',
      freight = '',
      sign = '',
      orderNo = '',
      unifiedOrderNo = ''
    } = { ...route.params, ...link.query }

    const params = {
      merchantId: useAppStore().merchantId,
      uid,
      submitOrderTime,
      orderId,
      totalMoney,
      freight,
      sign,
      orderNo,
      unifiedOrderNo
    }

    onMounted(() => {
      onCreateOrder()
    })

    const state = reactive({
      orderNo: '',
      unifiedOrderNo: '',
      status: 'loading'
    })

    const onCreateOrder = () => {
      // 小程序 WebView 环境中，直接重定向到此页面的小程序页
      if (process.env.TARO_ENV === 'h5' && window.__wxjs_environment === 'miniprogram') {
        useToast('打开小程序中...')

        console.log('打开小程序中...', buildUrl('/packageOther/jd-cashier/index', params))

        window.wx.miniProgram.redirectTo({
          url: buildUrl('/packageOther/jd-cashier/index', params)
        })
        return void 0
      }

      if (orderNo && unifiedOrderNo) {
        onPay(orderNo, unifiedOrderNo)
        return void 0
      }

      useLoading()
      $createJdOrder(params)
        .then(res => {
          const { orderNo, unifiedOrderNo } = res.data || {}

          state.orderNo = orderNo
          state.unifiedOrderNo = unifiedOrderNo

          if (orderNo && unifiedOrderNo) {
            state.status = 'success'
            onPay(orderNo, unifiedOrderNo)
          } else {
            state.status = 'error'
          }
          useResponseMessage(res)
        })
        .catch(err => {
          useResponseMessage(err)
          state.status = 'error'
        })
        .finally(useLoadingEnd)
    }

    const onPay = withLogin((orderNo: string = state.orderNo, unifyOrderNo: string = state.unifiedOrderNo) => {
      state.status = 'pay'
      if (process.env.TARO_ENV === 'h5' && window.__wxjs_environment === 'miniprogram') {
        // 小程序 WebView 环境中，直接重定向到小程序支付结果页，由小程序完成支付

        window.wx.miniProgram.redirectTo({
          url: buildUrl('/packageA/pay/result', {
            orderNo: orderNo,
            unifyOrderNo: unifyOrderNo,
            supplier: 'jd'
          })
        })
        return void 0
      }

      nextTick(() => {
        useLoading()
        usePay(unifyOrderNo, {
          success: () => {
            useLoadingEnd()
          },
          fail: () => {
            useLoadingEnd()
          },
          complete: () => {
            useLoadingEnd()
            navigateToPayResult({
              orderNo: orderNo,
              unifyOrderNo: unifyOrderNo,
              supplier: 'jd',
              redirect: true
            })
          },
          // h5（未支持支付） -> 打开小程序支付结果页 -> 完成支付
          payResultPath: buildUrl('/packageA/pay/result', {
            orderNo: orderNo,
            unifyOrderNo: unifyOrderNo,
            supplier: 'jd'
          })
        })
      })

      // return void 0

      // if (process.env.TARO_ENV !== 'h5') {
      //   useToast('请在小程序环境中打开')
      //   return void 0
      // } else {
      //   if (window.__wxjs_environment === 'miniprogram') {
      //     // 重定向到小程序的支付页，连同参数一起传进去
      //     window.wx.miniProgram.redirectTo({
      //       url: '/packageA/pay/result'
      //     })
      //   } else {
      //     useToast('请在小程序环境中打开')
      //   }
      // }
    })

    const Content = () => {
      if (state.status === 'loading') {
        return <EmptyStatus image={<Spin />} description="订单加载中，请稍候" />
      } else if (state.status === 'error') {
        return <EmptyStatus title="订单异常" description="无法完成支付，请稍后再试" />
      }
      return (
        <div class="jd-cashier-page">
          <div class="jd-cashier">
            <div class="title">您有一笔订单待支付~</div>
            <div class="subtitle">请点击下方按钮完成支付，避免超时订单自动取消</div>
            <div class="main-button" onClick={() => onPay()}>
              立即支付
            </div>
          </div>
          {/* <div style="padding: 24px">{location.href}</div> */}
        </div>
      )
    }

    return () => {
      return (
        <BasePage
          needLogin
          navigator={
            state.status !== 'error'
              ? process.env.TARO_ENV === 'h5'
                ? null
                : {
                    title: '京东收银台'
                  }
              : {
                  title: '订单异常'
                }
          }
        >
          <Content />
        </BasePage>
      )
    }
  }
})
