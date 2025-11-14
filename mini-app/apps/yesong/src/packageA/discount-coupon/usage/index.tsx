import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import './style.scss'
import {
  BasePage,
  EmptyStatus,
  useLoading,
  useLoadingEnd,
  usePagination,
  useResponseMessage,
  withLogin
} from '@anteng/core'
import CouponItem, { CouponItemButton } from '../components/coupon-item'
import GoodsList from '../../../components/goods-list'
import { $getGoodsList } from '../../../api'
import {
  $getDiscountCouponRecordDetail,
  $getDiscountCouponTemplateDetail,
  $getDiscountCouponUseableGoods,
  $receiveDiscountCoupon
} from '../../../api/discount-coupon'
import { useRouter } from '@tarojs/taro'
import { couponUseTimeRangeType, IDiscountCoupon, IDiscountCouponRecord } from '../../../api/discount-coupon/types'
import dayjs from 'dayjs'
import { Icon } from '@anteng/ui'
import { DiscountCouponScene } from '../../../constants/discount-coupon'

definePageConfig({
  navigationStyle: 'custom'
})

export default defineComponent({
  name: '',
  setup() {
    const route = useRouter()
    const recordNo = route.params.recordNo
    const couponDetail = ref<IDiscountCouponRecord>()

    const templateId = computed(() => couponDetail.value?.templateId ?? route.params.templateId)

    const isTemplate = computed(() => !recordNo && !!templateId.value)

    if (recordNo === 'null' || recordNo === 'undefined' || (!recordNo && !templateId.value)) {
      return () => {
        return (
          <BasePage
            expired
            customExpired={() => {
              return <EmptyStatus title="链接已失效" description="找不到对应优惠券" />
            }}
          />
        )
      }
    }

    const getDetail = async () => {
      return $getDiscountCouponRecordDetail(recordNo!)
        .then(res => {
          couponDetail.value = res.data
        })
        .catch(useResponseMessage)
    }

    const couponTemplate = ref<IDiscountCoupon>()
    const getTemplate = async () => {
      return $getDiscountCouponTemplateDetail(templateId.value!)
        .then(res => {
          couponTemplate.value = res.data
        })
        .catch(useResponseMessage)
    }

    const { data, fetchData, refreshData, CommonPaginationStatus } = usePagination({
      requestHandler: params => {
        return $getDiscountCouponUseableGoods({
          ...params,
          // recordNo: recordNo,
          templateId: templateId.value,
          descs: 'sort'
        })
        return $getGoodsList(params)
      }
    })

    onMounted(() => {
      if (isTemplate.value) {
        getTemplate()
      } else {
        getDetail()
      }
    })

    watch(
      () => templateId.value,
      () => {
        if (templateId.value) {
          refreshData()
        }
      },
      {
        immediate: true
      }
    )

    const goodsList = computed(() => {
      return data.value.map((item: any) => {
        const goods = {
          id: item.id,
          name: item.title,
          price: item.priceMin,
          priceMax: item.priceMax,
          listPrice: item.underlinePrice,
          image: item.coverImages?.[0]
        }
        return goods
      })
    })

    const tips = (item: IDiscountCouponRecord) => {
      const start = dayjs(item.startTime)
      if (dayjs().isBefore(start)) {
        return (
          <div>
            <Icon name="help" />
            &nbsp;未到可用时间，{start.format('YYYY.MM.DD HH:mm:ss')} 后可用
          </div>
        )
      }
      return null
    }

    const onReceive = withLogin((item: IDiscountCoupon) => {
      useLoading()
      $receiveDiscountCoupon({
        couponId: item.id,
        couponScene: DiscountCouponScene.couponTemplate
      })
        .then(res => {
          useResponseMessage(res)
        })
        .catch(err => {
          useResponseMessage(err)
        })
        .finally(() => {
          useLoadingEnd()
          getTemplate()
        })
    })
    const valid = (item: IDiscountCoupon) => {
      const { useType, useEndTime, limitedDays } = item

      if (useType === couponUseTimeRangeType.timeRange) {
        return `有效期至 ${dayjs(useEndTime).format('YYYY.MM.DD')}`
      }

      return `自领取后 ${limitedDays} 天内可用`
    }

    const Coupon = () => {
      if (isTemplate.value) {
        if (!couponTemplate.value) return null
        const { name, scope, discountAmount, thresholdAmount, useEndTime, instructions, hasRecord, receiveLimit } =
          couponTemplate.value
        return (
          <CouponItem
            name={name}
            amount={discountAmount / 100}
            threshold={thresholdAmount / 100}
            useRules={instructions}
            validDateText={valid(couponTemplate.value)}
            scope={scope}
            tips={tips(couponTemplate.value as any)}
            stamp={hasRecord ? '已领取' : undefined}
            stampSize={hasRecord && !(receiveLimit > 0) ? 'normal' : 'small'}
            button={() => {
              if (hasRecord && !(receiveLimit > 0)) {
                return null
                // return (
                //   <CouponItemButton
                //     text="去使用"
                //     centered
                //     onClick={() => {
                //       onUse(couponTemplate.value)
                //     }}
                //   ></CouponItemButton>
                // )
              }
              return (
                <div style={'margin: auto 0;'}>
                  <CouponItemButton
                    text={'领取'}
                    primary
                    onClick={() => {
                      onReceive(couponTemplate.value!)
                    }}
                  ></CouponItemButton>
                  {hasRecord && <div class="discount-coupon-usage__continue-tips">还可领 {receiveLimit} 张</div>}
                </div>
              )
            }}
          />
        )
      }

      if (!couponDetail.value) return null
      const { name, scope, discountAmount, thresholdAmount, endTime, couponSnapshot } = couponDetail.value
      return (
        <CouponItem
          name={name}
          scope={scope}
          amount={discountAmount / 100}
          threshold={thresholdAmount / 100}
          validDate={endTime}
          stamp="已领取"
          useRules={couponSnapshot?.instructions}
          tips={tips(couponDetail.value)}
        />
      )
    }

    return () => {
      return (
        <BasePage
          navigator={{
            title: '使用优惠券',
            navigatorStyle: 'immersive',
            navigationBarBackgroundColor: 'rgba(0, 0, 0, 0)',
            navigationBarBackgroundColorFixed: 'rgba(0, 0, 0, 0)',
            navigationBarTextStyle: 'white',
            navigationBarTextStyleFixed: 'white'
          }}
          useScrollView
          scrollView={{
            onScrollToLower: fetchData
          }}
        >
          <div class="discount-coupon-usage">
            <div class="discount-coupon-usage__header">
              <Coupon />
            </div>
            <div class="discount-coupon-usage__goods">
              <GoodsList list={goodsList.value} />
              <CommonPaginationStatus />
            </div>
          </div>
        </BasePage>
      )
    }
  }
})
