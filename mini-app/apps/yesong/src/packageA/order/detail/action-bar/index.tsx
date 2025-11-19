import dayjs from 'dayjs'
import { IOrderDetail } from '../../../../api/order/types'
import { ORDER_STATUS_PENDING_PAYMENT } from '../../../../constants'
import useMerchantStore from '../../../../stores/merchant'
import './style.scss'
import { usePay } from '@anteng/core'
import { navigateToPayResult } from '../../../../router'
import { defineComponent, PropType } from 'vue'
import { triggerOrderItemRefresh } from '../../../../utils/emitter'
import useOrderStore from '../../../../stores/orderStore'
import useAfterSale from '../../after-sale/useAfterSale'

export default defineComponent({
  props: {
    orderDetail: {
      type: Object as PropType<IOrderDetail>,
      required: true
    }
  },
  setup(props) {
    const merchantStore = useMerchantStore()

    const orderStore = useOrderStore()
    const cancel = () => {
      orderStore.cancelOrder(props.orderDetail.id)
    }

    const handleAfterSale = () => {
      useAfterSale({ mainOrderNo: props.orderDetail.orderNo })
    }

    const AfterSale = () => {
      return (
        <div class="action" onClick={handleAfterSale}>
          售后申请
        </div>
      )
    }

    return () => {
      // 待付款
      if (props.orderDetail?.status === ORDER_STATUS_PENDING_PAYMENT) {
        const { id, createTime, orderNo, unifiedOrder } = props.orderDetail

        const paymentEndTime = merchantStore.calcPaymentEndTime(createTime)
        const isValid = dayjs().isBefore(paymentEndTime)
        const pay = () => {
          usePay(unifiedOrder.orderNo, {
            complete: () => {
              triggerOrderItemRefresh(id)
              navigateToPayResult({
                orderNo: orderNo,
                unifyOrderNo: unifiedOrder.orderNo
              })
            }
          })
        }
        if (isValid) {
          return (
            <>
              <div class="order-detail__action-bar">
                <div class="content">
                  <div class="action" onClick={cancel}>
                    取消订单
                  </div>
                  <div class="action primary" onClick={pay}>
                    立即支付
                  </div>
                </div>
              </div>
              <div class="order-detail__action-bar--block"></div>
            </>
          )
        }
        return null
      }

      return null
    }
  }
})
