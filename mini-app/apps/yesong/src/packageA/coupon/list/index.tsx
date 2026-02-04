import './style.scss'
import { BasePage, EmptyStatus, useAppStore, usePagination, useUserStore } from '@pkg/core'
import { Button, ScrollView, Swiper, SwiperItem } from '@tarojs/components'
import { computed, defineComponent, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import OrderItem from './order-item'
import { getCouponList } from '../../../api/coupon'
import {
  COUPON_STATUS_CANCELED,
  COUPON_STATUS_EXPIRED,
  COUPON_STATUS_PENDING_USE,
  COUPON_STATUS_USED
} from '../../../constants'
import { backToIndex } from '../../../router'

definePageConfig({
  navigationStyle: 'custom',
  disableScroll: true
})

const canBeUsed = ref(0)
const numberOfInvalids = ref(0)
const haveBeenUsed = ref(0)

// 获取可使用/已失效的数量角标
const getCount = () => {
  getCouponList({ status: `${COUPON_STATUS_PENDING_USE}` }).then(res => {
    canBeUsed.value = res.data.total
  })
  getCouponList({ status: `${COUPON_STATUS_USED}` }).then(res => {
    haveBeenUsed.value = res.data.total
  })
  getCouponList({ status: `${COUPON_STATUS_EXPIRED},${COUPON_STATUS_CANCELED}` }).then(res => {
    numberOfInvalids.value = res.data.total
  })
}

const tabs = computed(() => [
  {
    title: '可使用' + `(${canBeUsed.value})`,
    value: `${COUPON_STATUS_PENDING_USE}`,
    loaded: true
  },
  {
    title: '已使用' + `(${haveBeenUsed.value})`,
    value: `${COUPON_STATUS_USED}`,
    loaded: true
  },
  {
    title: '已失效' + `(${numberOfInvalids.value})`,
    value: `${COUPON_STATUS_EXPIRED},${COUPON_STATUS_CANCELED}`,
    loaded: false
  }
])

export default defineComponent({
  name: 'OrderListPage',
  setup() {
    const appStore = useAppStore()
    const { commonPageHeightStyle } = storeToRefs(appStore)
    const userStore = useUserStore()
    const { isLogin } = storeToRefs(userStore)

    const currentIndex = ref(0)
    const toggleTab = (type: any) => {
      tabs.value.map((it, index) => {
        if (it.value === type) {
          it.loaded = true
          currentIndex.value = index
        } else {
          it.loaded = false
        }
      })
    }

    const init = () => {
      toggleTab(`${COUPON_STATUS_PENDING_USE}`)
      getCount()
    }

    init()

    return () => {
      return (
        <BasePage navigator={{ title: '我的卡券' }}>
          <div class="coupon-order-list-page" style={commonPageHeightStyle.value}>
            <div class="coupon-order-list__tab">
              {tabs.value.map((item, index) => {
                return (
                  <div
                    class={['coupon-order-list__tab-item', index == currentIndex.value && 'active']}
                    onClick={() => toggleTab(item.value)}
                  >
                    {item.title}
                  </div>
                )
              })}
            </div>

            {!isLogin.value ? (
              <EmptyStatus type="login" />
            ) : (
              <div class="coupon-order-list__content">
                <Swiper
                  class="swiper"
                  current={currentIndex.value}
                  onChange={e => {
                    toggleTab(tabs.value[e.detail.current].value)
                  }}
                >
                  {tabs.value.map(item => {
                    return (
                      <SwiperItem key={item.value} class="swiper-item">
                        {item.loaded ? <OrderList status={item.value} /> : null}
                      </SwiperItem>
                    )
                  })}
                </Swiper>
              </div>
            )}
          </div>
        </BasePage>
      )
    }
  }
})

const OrderList = defineComponent({
  props: {
    status: {
      type: String,
      default: '1'
    }
  },
  setup(props) {
    const pagination = usePagination({
      dataIndex: 'id',
      requestHandler: params => {
        return getCouponList({
          ...params,
          size: 20,
          descs: 'create_time',
          status: props.status
        })
      },
      customEmpty: () => {
        return (
          <>
            <EmptyStatus title="空空如也" description="找不到相关订单" />
            <div class="button-limted">
              <Button class="buy-button" onClick={() => backToIndex('home', true)}>
                去购买
              </Button>
            </div>
          </>
        )
      }
    })

    const {
      fetchData,
      data: listRef,
      refresherTriggered,
      refreshData,
      EndTip,
      Empty,
      Loading,
      ErrorStatus
    } = pagination

    type Order = any[]

    const renderList = computed(() => {
      // 使用 Map 对 `mainOrderNo` 进行分组
      const orderMap: Map<string, Order> = new Map()

      listRef.value.forEach(order => {
        const { mainOrderNo } = order as any
        if (!orderMap.has(mainOrderNo)) {
          orderMap.set(mainOrderNo, [order])
        } else {
          orderMap.get(mainOrderNo)?.push(order)
        }
      })

      // 根据分组情况返回结果
      const result: (Order | Order[])[] = []
      orderMap.forEach(groupedOrders => {
        result.push(groupedOrders)
      })

      return result
    })

    onMounted(() => {
      fetchData()
    })

    return () => {
      return (
        <ScrollView
          class="scroller"
          refresherBackground="transparent"
          scrollY
          refresherEnabled
          refresherTriggered={refresherTriggered.value}
          onRefresherrefresh={() => refreshData()}
          onScrolltolower={fetchData}
        >
          <div class="sub-page">
            {renderList.value.map(coupons => {
              return <OrderItem key={coupons[0]?.mainOrderNo} coupons={coupons} />
            })}
            <ErrorStatus />
            <Loading />
            <Empty />
            <EndTip />
          </div>
        </ScrollView>
      )
    }
  }
})
