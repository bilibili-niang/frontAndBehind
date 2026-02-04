import { BasePage, emitter, EmptyStatus, useAppStore, usePagination, useUserStore } from '@pkg/core'
import { ScrollView, Swiper, SwiperItem } from '@tarojs/components'
import { useRouter } from '@tarojs/taro'
import { $getAfterSaleOrders, getOrderList } from '../../../api/order'
import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue'
import './style.scss'
import { storeToRefs } from 'pinia'
import OrderItem from './order-item'
import { EMITTER_ORDER_REFRESH } from '../../../utils/emitter'
import AfterSaleItem from './after-sale-item'

definePageConfig({
  navigationStyle: 'custom',
  disableScroll: true
})

export default defineComponent({
  name: 'OrderListPage',
  setup() {
    const appStore = useAppStore()
    const { commonPageHeightStyle } = storeToRefs(appStore)

    const userStore = useUserStore()
    const { isLogin } = storeToRefs(userStore)

    const enterType = useRouter().params.type

    const tabs = ref([
      { title: '全部', value: undefined, loaded: false },
      { title: '待付款', value: 1, loaded: false },
      { title: '待发货', value: 2, loaded: false },
      { title: '待收货', value: 3, loaded: false },
      { title: '退款／售后', value: 4, loaded: false }
    ])

    const currentType = ref(enterType)
    const currentIndex = computed(() => {
      return tabs.value.findIndex(item => item.value == currentType.value)
    })
    const toggleTab = (type: any) => {
      if (!isLogin.value) return void 0
      const target = tabs.value.find(item => item.value == type)
      if (!target) {
        toggleTab(tabs.value[0].value)
        return void 0
      }
      currentType.value = type
      target.loaded = true
    }

    toggleTab(enterType)

    return () => {
      return (
        <BasePage navigator={{ title: '订单列表' }}>
          <div class="order-list-page" style={commonPageHeightStyle.value}>
            <div class="order-list__tab">
              {tabs.value.map(item => {
                return (
                  <div
                    class={['order-list__tab-item', item.value == currentType.value && 'active']}
                    onClick={() => {
                      toggleTab(item.value)
                    }}
                  >
                    {item.title}
                  </div>
                )
              })}
            </div>
            {!isLogin.value ? (
              <EmptyStatus type="login" />
            ) : (
              <div class="order-list__content">
                <Swiper
                  class="swiper"
                  current={currentIndex.value}
                  onChange={e => {
                    toggleTab(e.detail.current)
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
    status: {}
  },
  setup(props) {
    const pagination = usePagination({
      dataIndex: 'id',
      requestHandler: params => {
        if (props.status === 4) return $getAfterSaleOrders(params)
        return getOrderList({
          ...params,
          tabStatus: props.status
        })
      },
      customEmpty: () => {
        return <EmptyStatus title="空空如也" description="找不到相关订单" />
      }
    })

    const {
      fetchData,
      data: listRef,
      refreshDataItem,
      refresherTriggered,
      refreshData,
      EndTip,
      Empty,
      Loading,
      ErrorStatus
    } = pagination

    onMounted(() => {
      fetchData()
    })

    /** 刷新单个订单子项 */
    const onRefreshOrderItem = (orderId: string) => {
      refreshDataItem(orderId)
    }
    // 监听其他页面触发的刷新单个订单子项事件
    emitter.on(EMITTER_ORDER_REFRESH, onRefreshOrderItem)
    onUnmounted(() => {
      emitter.off(EMITTER_ORDER_REFRESH, onRefreshOrderItem)
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
            {listRef.value.map(item => {
              return props.status === 4 ? (
                <AfterSaleItem key={item.id} orderDetail={item} />
              ) : (
                <OrderItem key={item.id} orderDetail={item} />
              )
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
