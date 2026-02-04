import { computed, defineComponent, onMounted, reactive, withModifiers } from 'vue'
import { Icon } from '@pkg/ui'
import './style.scss'
import { navigateTo } from '@pkg/core'
import { requestGetOrderCounts } from '../../../../api/order'
import { navigateToOrderList } from '../../../../router'

definePageConfig({
  navigationStyle: 'custom'
})

export default defineComponent({
  name: 'ProfilePageOrder',
  setup() {
    const toOrderList = () => {
      navigateTo({
        url: '/packageA/order/list/index'
      })
    }

    const tabs = computed(() => {
      return [
        { title: '待付款', value: 1, icon: 'order-pay', count: counts.pendingPayment },
        { title: '待发货', value: 2, icon: 'order-send', count: counts.pendingShipment },
        { title: '待收货', value: 3, icon: 'order-deliver', count: counts.pendingComplete },
        { title: '退款／售后', value: 4, icon: 'order-refund', count: counts.refundAfterSale }
      ]
    })

    const onItemClick = (item: (typeof tabs.value)[number]) => {
      navigateToOrderList(item.value)
    }

    const counts = reactive({
      all: 0,
      pendingComplete: 0,
      pendingPayment: 0,
      pendingShipment: 0,
      refundAfterSale: 0
    })

    const getOrderCounts = () => {
      requestGetOrderCounts().then(res => {
        if (res.code === 200) {
          Object.assign(counts, res.data)
        }
      })
    }

    onMounted(() => {
      getOrderCounts()
    })

    return () => {
      return (
        <div class="profile-order" onClick={toOrderList}>
          <div class="profile-order__header">
            <div class="profile-order__title">我的订单</div>
            <div class="profile-order__all">
              全部订单
              <Icon name="right" />
            </div>
          </div>
          <div class="profile-order__content">
            {tabs.value.map((item, index) => {
              return (
                <div
                  class="profile-order__item"
                  onClick={withModifiers(() => {
                    onItemClick(item)
                  }, ['stop'])}
                >
                  <Icon class="profile-order__icon" name={item.icon} />
                  {item.count > 0 && <div class={['profile-order__badge', index === 0 && 'flicker']}>{item.count}</div>}
                  <div class="profile-order__name">{item.title}</div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }
  }
})
