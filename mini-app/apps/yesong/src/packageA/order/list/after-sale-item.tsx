import { computed, defineComponent } from 'vue'
import './order-item.scss'
// import './after-sale-item.scss'
import GoodsItem from '../../../components/goods-item'
import { navigateToAfterSaleResult } from '../../../router'
import { ORDER_AFTER_SALES_STATUS_OPTIONS } from '../../../constants'

export default defineComponent({
  name: 'OrderItem',
  props: {
    orderDetail: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const statusText = computed(() => {
      return ORDER_AFTER_SALES_STATUS_OPTIONS.find(item => item.value === props.orderDetail.status)?.label
    })

    const toDetail = () => {
      navigateToAfterSaleResult(props.orderDetail.afterSaleOrderNo)
    }

    const actions = computed(() => {
      return (
        <div class="order-item__footer">
          <div class="order-item__action">查看进度</div>
        </div>
      )
    })

    return () => {
      if (!props.orderDetail) return null
      const { afterSaleOrderNo, freightAmount, payAmountText, status, payStatus, amount } = props.orderDetail
      const subOrders = [props.orderDetail.subOrder]
      return (
        <div class="order-list-item" onClick={toDetail}>
          <div class="order-item__header">
            <div class="order-item__id">售后单号：{afterSaleOrderNo}</div>
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
          {actions.value}
        </div>
      )
    }
  }
})
