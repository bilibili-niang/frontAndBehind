import {
  BasePage,
  EmptyStatus,
  getStackDeltaOfPages,
  onPageShow,
  Spin,
  useContact,
  useCountdown,
  usePay
} from '@anteng/core'
import { computed, defineComponent, onMounted, onUnmounted, PropType, ref } from 'vue'
import './result.scss'
import SPIN from './spin.json'
import { Lottie } from '../../hooks/useLottie'
import { getGoodsOrderDetail } from '../../api/order'
import Taro, { useRouter } from '@tarojs/taro'
import { COMMON_STATUS_OFF, COMMON_STATUS_ON } from '../../constants'
import useMerchantStore from '../../stores/merchant'
import dayjs from 'dayjs'
import { backToIndex, navigateBack, navigateToJdOrderList, redirectToOrderDetail } from '../../router'
import { triggerOrderItemRefresh } from '../../utils/emitter'
import { ROUTE_ORDER_DETAIL } from '../../router/routes'
import Recommended from '../../components/recommended'
import { PAYMENT_CHANNEL_BALANCE } from '@anteng/config'

definePageConfig({
  navigationStyle: 'custom'
})

export default defineComponent({
  name: 'PayResult',
  setup() {
    const route = useRouter()
    const pages = Taro.getCurrentPages()
    const currentPage = pages?.[pages?.length - 1]

    // 因为微信支付可能导致 route 路由参数错误，需使用 currentPage 进行兜底兼容处理
    const orderNo: string = route.params?.orderNo ?? currentPage?.options?.orderNo
    const unifyOrderNo = route.params?.unifyOrderNo ?? currentPage?.options?.unifyOrderNo
    const supplier = route.params?.supplier ?? currentPage?.options?.supplier ?? orderNo.startsWith('JO') ? 'jd' : ''

    const merchantStore = useMerchantStore()

    const orderDetail = ref<any>(null)
    const errMsg = ref('')
    const isLoading = ref(true)
    const payStatus = computed(() => {
      if (isLoading.value) return 'LOADING'
      if (!orderDetail.value) return 'ERROR'
      if (orderDetail.value?.payStatus === COMMON_STATUS_ON) return 'SUCCESS'
      const expireTime = merchantStore.calcPaymentEndTime(orderDetail.value!.createTime)
      if (orderDetail.value?.payStatus === COMMON_STATUS_OFF && dayjs().isAfter(expireTime)) return 'EXPIRE'
      if (orderDetail.value?.payStatus === COMMON_STATUS_OFF && dayjs().isBefore(expireTime)) return 'PENDING'
      return 'UNKNOWN'
    })
    const getData = (silent = false) => {
      if (!orderNo) return void 0
      errMsg.value = ''
      if (!silent) {
        isLoading.value = true
      }
      getGoodsOrderDetail(orderNo, supplier)
        .then(res => {
          if (res.code === 200 && res.data) {
            orderDetail.value = res.data
            clearTimeout(autoRefreshTimer)
            autoRefreshTimer = setTimeout(autoRefresh, 1000)
          } else {
            errMsg.value = res.msg
          }
        })
        .catch(err => {
          errMsg.value = err.response?.data.msg ?? err.message
        })
        .finally(() => {
          isLoading.value = false
        })
    }

    let autoRefreshTimer: NodeJS.Timeout
    let autoRefreshCount = 0
    const autoRefresh = () => {
      if (isLoading.value) return void 0
      if (payStatus.value === 'PENDING' && autoRefreshCount < 5) {
        autoRefreshCount++
        getData(true)
      }
    }

    let refreshCount = ref(0)
    const refresh = () => {
      if (isLoading.value) return void 0
      refreshCount.value++
      getData()
    }

    onMounted(() => {
      getData()
    })

    if (process.env.TARO_ENV === 'h5') {
      // 从后台切入、从小程序返回时刷新订单状态
      function checkPageActive() {
        // 检查 document.visibilityState 的值
        if (document.visibilityState === 'visible') {
          // 页面处于激活状态
          console.log('页面处于激活状态')
          refresh()
        } else if (document.visibilityState === 'hidden') {
          // 页面不处于激活状态
        }
      }
      document.addEventListener('visibilitychange', checkPageActive)

      onUnmounted(() => {
        clearTimeout(autoRefreshTimer)
        document.removeEventListener('visibilitychange', checkPageActive)
      })
    }

    onPageShow(() => {
      refresh()
    })

    const backToIndexPage = () => {
      backToIndex()
    }

    const toOrderDetail = () => {
      // 如果是从订单详情页支付的话，返回上一页
      if (getStackDeltaOfPages(ROUTE_ORDER_DETAIL) === 1) {
        navigateBack()
      } else {
        if (supplier === 'jd') {
          navigateToJdOrderList()
          return void 0
        }

        redirectToOrderDetail(orderNo!)
      }
    }

    const recommendRule = Taro.getStorageSync('recommendRule')
    return () => {
      if (!orderNo || errMsg.value) {
        console.log('错误信息：', `${orderNo}, ${unifyOrderNo}, ${errMsg.value}`)
        return (
          <BasePage navigator={{ title: '失效链接' }}>
            <EmptyStatus title="无法支付" description={errMsg.value} />
          </BasePage>
        )
      }

      return (
        <BasePage navigator={{ title: '支付结果' }}>
          <div class="pay-result">
            {payStatus.value === 'LOADING' && (
              <div class="pay-result__status">
                <div class="pay-result__spin">
                  <Spin style="width:100%;height:100%" />
                </div>
                <div class="pay-result__desc">正在查询中</div>
              </div>
            )}
            {payStatus.value === 'SUCCESS' && (
              <div class="pay-result__status end">
                <div class="pay-result__spin">
                  <Lottie animationData={SPIN} autoplay loop={false} segments={[31, 55]} />
                </div>
                <div class="pay-result__title">支付成功</div>
                <div class="pay-result__actions">
                  <div class="pay-result__action" onClick={backToIndexPage}>
                    返回首页
                  </div>
                  <div class="pay-result__action" onClick={toOrderDetail}>
                    查看订单
                  </div>
                </div>
              </div>
            )}
            {payStatus.value === 'ERROR' && (
              <div>
                <EmptyStatus
                  title="无法支付"
                  description={
                    <>
                      <div>当前订单已过期／不存在</div>
                      <div>{errMsg.value}</div>
                    </>
                  }
                />
                <div class="pay-result__actions">
                  <div class="pay-result__action" onClick={backToIndexPage}>
                    返回首页
                  </div>
                </div>
              </div>
            )}
            {payStatus.value === 'EXPIRE' && (
              <div class="pay-result__status end">
                <div class="pay-result__spin">
                  <Lottie animationData={SPIN} autoplay loop={false} segments={[56, 83]} />
                </div>
                <div class="pay-result__title">支付失败</div>
                <div class="pay-result__desc">订单支付时间已过期</div>
                <div class="pay-result__actions">
                  <div class="pay-result__action" onClick={backToIndexPage}>
                    返回首页
                  </div>
                </div>
              </div>
            )}
            {payStatus.value === 'PENDING' && (
              <PendingPay
                unifyOrderNo={unifyOrderNo!}
                order={orderDetail.value}
                onRefresh={refresh}
                refreshCount={refreshCount.value}
                supplier={supplier}
              />
            )}
          </div>
          <Recommended type={recommendRule.payPage} />
        </BasePage>
      )
    }
  }
})

const PendingPay = defineComponent({
  props: {
    unifyOrderNo: {
      type: String,
      required: true
    },
    order: {
      type: Object as PropType<any>,
      required: true
    },
    refreshCount: {
      type: Number,
      required: true
    },
    supplier: String
  },
  emits: ['refresh'],
  setup(props, { emit }) {
    const refresh = () => {
      triggerOrderItemRefresh(props.order.id)
      emit('refresh')
    }

    const expireTime = useMerchantStore().calcPaymentEndTime(props.order.createTime)
    const { countdownTime, onCountdownEnd } = useCountdown(expireTime)
    onCountdownEnd(() => {
      refresh()
    })

    const pay = () => {
      usePay(props.unifyOrderNo, {
        complete: () => refresh()
      })
    }

    const balanceAmount = computed(() => {
      const v = props.order.paymentChannelInfos?.find(
        item => item.paymentChannel === PAYMENT_CHANNEL_BALANCE
      )?.totalAmount
      return v > 0 ? v : 0
    })

    const payAmount = computed(() => {
      return ((props.order.payAmount - balanceAmount.value) / 100).toFixed(2)
    })

    return () => {
      return (
        <div class="pay-result__pending">
          <div class="count-down">支付剩余 {countdownTime.value}</div>
          <div class="amount number-font">
            <div class="yen">&yen;</div>
            {payAmount.value}
          </div>
          <div class="desc">未付款</div>
          <div class={['pay-action', props.supplier]} onClick={pay}>
            继续支付
          </div>
          <div class="tip">
            已完成支付？
            <div class="refresh" onClick={refresh}>
              点击刷新
            </div>
          </div>
          {props.refreshCount >= 1 && (
            <>
              <div class="tip">支付结果可能存在延迟情况，请勿重复支付</div>
              <div class="tip" style="margin-top:0">
                如对支付结果有疑问，请
                <div
                  class="service"
                  onClick={() => {
                    useContact({
                      // contacts: [{ name: '电话客服', mobile: '110' }],
                      onlineContact: true
                    })
                  }}
                >
                  联系客服
                </div>
                查询
              </div>
            </>
          )}
        </div>
      )
    }
  }
})
