import { computed, defineComponent, withModifiers } from 'vue'
import './order-item.scss'
import GoodsItem from '../../../components/goods-item'
import { formatPrice } from '@anteng/utils'
import { navigateToOrderDetail, navigateToPayResult } from '../../../router'
import { useCountdown, usePay } from '@anteng/core'
import {
  COMMON_STATUS_ON,
  GOODS_TYPE_ENTITY,
  ORDER_PAYMENT_STATUS_PENDING,
  ORDER_STATUS_CLOSED,
  ORDER_STATUS_OPTIONS,
  ORDER_STATUS_PENDING_DELIVERY
} from '../../../constants'
import useMerchantStore from '../../../stores/merchant'
import { triggerOrderItemRefresh } from '../../../utils/emitter'
import useOrderStore from '../../../stores/orderStore'
import useAfterSale from '../after-sale/useAfterSale'
import { PAYMENT_CHANNEL_BALANCE } from '@anteng/config'

export default defineComponent({
  name: 'OrderItem',
  props: {
    orderDetail: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const merchantStore = useMerchantStore()
    const orderStore = useOrderStore()

    // 付款截止时间
    const paymentEndTime = merchantStore.calcPaymentEndTime(props.orderDetail.createTime)
    const { countdownSeconds, countdownTime } = useCountdown(paymentEndTime)

    const statusText = computed(() => {
      // 不为实物商品且状态为 待收货 时,展示已发放文字
      if (commodityType.value !== 0 && props.orderDetail.status === ORDER_STATUS_PENDING_DELIVERY) {
        return '已发放'
      } else {
        return ORDER_STATUS_OPTIONS().find(item => item.value === props.orderDetail.status)?.label
      }
    })

    // 商品类型,下面只有商品类型为实物商品才显示确认收货
    const commodityType = computed(() => {
      const { orderDetail } = props
      return orderDetail.subOrders[0]?.type
    })

    const toDetail = () => {
      navigateToOrderDetail(props.orderDetail.orderNo)
    }

    const toPay = () => {
      const { id, orderNo, unifiedOrderNo } = props.orderDetail
      usePay(unifiedOrderNo, {
        complete: () => {
          // 触发刷新
          triggerOrderItemRefresh(id)
          navigateToPayResult({
            orderNo: orderNo,
            unifyOrderNo: unifiedOrderNo
          })
        }
      })
    }

    /** 取消订单 */
    const onCancel = () => {
      return orderStore.cancelOrder(props.orderDetail.id)
    }

    /** 确认收货 */
    const toComplete = () => {
      if (!props.orderDetail.uploadShippingInfo?.needUpload) {
        return orderStore.completeOrderSkipWechat(props.orderDetail.id)
      }
      return orderStore.completeOrder(props.orderDetail.id, props.orderDetail.uploadShippingInfo.transactionId)
    }

    const actions = computed(() => {
      const { status } = props.orderDetail
      if (status === ORDER_PAYMENT_STATUS_PENDING && countdownSeconds.value > 0) {
        return (
          <div class="order-item__footer">
            <div class="pay-count-down">支付剩余：{countdownTime.value}</div>
            <div class="order-item__action" onClick={withModifiers(onCancel, ['stop'])}>
              取消订单
            </div>
            <div class="order-item__action primary" onClick={withModifiers(toPay, ['stop'])}>
              立即支付
            </div>
          </div>
        )
      }

      if (status === ORDER_STATUS_PENDING_DELIVERY && GOODS_TYPE_ENTITY === commodityType.value) {
        return (
          <div class="order-item__footer">
            <div class="order-item__action primary" onClick={withModifiers(toComplete, ['stop'])}>
              确认收货
            </div>
          </div>
        )
      }

      // if (status !== ORDER_STATUS_CLOSED && status !== ORDER_STATUS_CANCELLED) {
      //   return (
      //     <div class="order-item__footer">
      //       <AfterSale />
      //     </div>
      //   )
      // }

      return null
    })

    const handleAfterSale = () => {
      useAfterSale({ mainOrderNo: props.orderDetail.orderNo })
    }

    const AfterSale = () => {
      return (
        <div class="order-item__action" onClick={handleAfterSale}>
          申请售后
        </div>
      )
    }

    const balanceAmount = computed(() => {
      const v = props.orderDetail.paymentChannelInfos?.find(
        item => item.paymentChannel === PAYMENT_CHANNEL_BALANCE
      )?.totalAmount
      return v > 0 ? v : 0
    })

    const payAmount = computed(() => {
      return ((props.orderDetail.payAmount - balanceAmount.value) / 100).toFixed(2)
    })

    return () => {
      if (!props.orderDetail) return null
      const { orderNo, subOrders = [], freightAmount, status, payStatus } = props.orderDetail
      return (
        <div class="order-list-item" onClick={toDetail}>
          <div class="order-item__header">
            <div class="order-item__id">订单号：{orderNo}</div>
            <div class="order-item__status">{statusText.value}</div>
          </div>
          <div class="order-item__goods">
            {subOrders.map(item => {
              return (
                <GoodsItem
                  type="horizontal"
                  image={item.goodsStockSnapshot?.specs?.[0]?.image ?? item.coverImages?.[0]}
                  name={item.goodsName}
                  // desc={<div>{item.goodsStockId}</div>}
                  desc={item.goodsStockSnapshot?.specs?.map(spec => spec.v).join('／')}
                  price={item.amountText}
                  action={<div class="number-font">× {item.count}</div>}
                />
              )
            })}
          </div>
          {status !== ORDER_STATUS_CLOSED && (
            <div class="order-item__payment">
              {freightAmount > 0 && (
                <div class="order-item__freight number-font">含运费&yen;{formatPrice(freightAmount / 100)}</div>
              )}
              <div class="order-item__amount number-font">
                {payStatus === COMMON_STATUS_ON ? '实付款' : '应付款'}
                <div class="yen"> &yen;</div>
                <div class="value">{payAmount.value}</div>
              </div>
            </div>
          )}
          {actions.value}
        </div>
      )
    }
  }
})
