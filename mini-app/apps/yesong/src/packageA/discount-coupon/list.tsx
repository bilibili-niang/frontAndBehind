import { BasePage, emitter, TabPage, TabPageItem, useCommonTab, usePagination } from '@pkg/core'
import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue'
import './list.scss'
import { $getMyDiscountCouponList } from '../../api/discount-coupon'
import CouponItem, { CouponItemButton } from './components/coupon-item'
import { DISCOUNT_COUPON_STATUS_OPTIONS, DiscountCouponStatus } from '../../constants/discount-coupon'
import { useDiscountCouponStore } from '../../stores/discount-coupon'
import { storeToRefs } from 'pinia'
import { navigateToCouponUsage } from '../../router'

definePageConfig({
  navigationStyle: 'custom',
  defaultTitle: '场馆相册',
  disableScroll: true,
  enableShareAppMessage: false,
  enableShareTimeline: false
})

export default defineComponent({
  setup() {
    const categories = computed<{ value: number | undefined; name: string; count?: number; useable?: boolean }[]>(
      () => {
        return [
          { value: undefined, name: '全部', count: discountCouponCounts.value.all, useable: undefined },
          { value: 0, name: '可使用', count: discountCouponCounts.value.useable, useable: true },
          { value: 1, name: '已使用／失效', count: discountCouponCounts.value.expired, useable: false }
        ]
      }
    )

    const discountCouponStore = useDiscountCouponStore()

    const { discountCouponCounts } = storeToRefs(discountCouponStore)

    onMounted(() => {
      discountCouponStore.getDiscountCouponCounts()
    })

    const isPageScrolling = ref(false)
    let isPageScrollingTimer: NodeJS.Timeout

    let lastScrollTop = 0

    const scrollViewConfig: TabPageItem['scrollView'] = {
      onScroll: e => {
        const scrollTop = e.detail.scrollTop
        if (scrollTop > 20 && scrollTop > lastScrollTop) {
          isPageScrolling.value = true
          clearTimeout(isPageScrollingTimer)
          isPageScrollingTimer = setTimeout(() => {
            isPageScrolling.value = false
          }, 1000)
        }
        lastScrollTop = scrollTop
      },
      // @ts-ignore
      onScrolltolower: () => {
        // 所有分类的逻辑都是一样的，所以这里 scrollView 的滚动加载只需要判断当前属于哪个 tab
        emitter.trigger(`coupon-load-more:${categories.value[current.value]?.value}`)
      }
    }

    const { tabs, current, toggle } = useCommonTab({
      tabs: () => {
        return [
          ...categories.value.map(item => {
            return {
              key: item.value,
              title: (
                <div class="my-coupon-page__tab-item">
                  {item.name}
                  <div class="count number-font">{item.count}</div>
                </div>
              ),
              content: () => <CouponList status={item.value} useable={item.useable} />,
              scrollView: scrollViewConfig
            }
          })
        ]
      }
    })

    return () => {
      return (
        <BasePage
          enableGlobalShare={false}
          enableShareAppMessage={false}
          navigator={{
            navigatorStyle: 'immersive',
            title: '我的优惠券',
            navigationBarBackgroundColor: 'rgba(0, 0, 0, 0)',
            navigationBarBackgroundColorFixed: 'rgba(0, 0, 0, 0)',
            scrollTweenFrom: 0,
            scrollTweenTo: 0
          }}
        >
          <div class="my-coupon-page">
            <TabPage stretch={false} tabs={tabs.value} current={current.value} onChange={toggle}></TabPage>
          </div>
        </BasePage>
      )
    }
  }
})

const CouponList = defineComponent({
  props: {
    status: Number,
    useable: Boolean
  },
  setup(props) {
    const { data, fetchData, CommonPaginationStatus } = usePagination({
      requestHandler: params => {
        return $getMyDiscountCouponList({ ...params, useable: props.useable })
      }
    })

    onMounted(() => {
      fetchData()
    })

    // 监听下拉加载
    const loadMore = () => {
      fetchData()
    }
    emitter.on(`coupon-load-more:${props.status}`, loadMore)
    onUnmounted(() => {
      emitter.off(`coupon-load-more:${props.status}`, loadMore)
    })

    return () => (
      <div class="my-coupon-page__view">
        <div class="my-coupon-page__list">
          {data.value.map(item => {
            const disabled = item.status !== DiscountCouponStatus.useable
            const stamp = disabled
              ? DISCOUNT_COUPON_STATUS_OPTIONS.find(i => i.value === item.status)?.label
              : undefined
            return (
              <CouponItem
                name={item.name}
                amount={item.discountAmount / 100}
                threshold={item.thresholdAmount / 100}
                scope={item.scope}
                validDate={item.endTime}
                // @ts-ignore
                useRules={item.instructions ?? item.couponSnapshot?.instructions}
                disabled={disabled}
                stamp={stamp}
                button={
                  disabled ? null : (
                    <CouponItemButton
                      text="去使用"
                      primary
                      onClick={() => {
                        navigateToCouponUsage({
                          recordNo: item.recordNo
                        })
                      }}
                    />
                  )
                }
              />
            )
          })}
        </div>
        <CommonPaginationStatus />
      </div>
    )
  }
})
