import {
  EmptyStatus,
  useLoading,
  useLoadingEnd,
  useModal,
  usePagination,
  useResponseMessage,
  withLogin
} from '@anteng/core'
import { defineComponent } from 'vue'
import './style.scss'
import CouponItem, { CouponItemButton } from '../../packageA/discount-coupon/components/coupon-item'
import { couponUseTimeRangeType, IDiscountCoupon } from '../../api/discount-coupon/types'
import { $receiveDiscountCoupon } from '../../api/discount-coupon'
import dayjs from 'dayjs'
import { Icon } from '@anteng/ui'
import { navigateToCouponUsage } from '../../router'
import { DiscountCouponScene } from '../../constants/discount-coupon'

/** 领取优惠券弹窗 */
const useReceiveCoupon = (
  pagination: ReturnType<typeof usePagination<IDiscountCoupon>>,
  options?: {
    scene?: DiscountCouponScene
    goodsGroupId?: string
    goodsId?: string
  }
) => {
  const { data, refreshData, refreshDataItem, CommonPaginationStatus } = pagination

  const onReceive = withLogin((item: IDiscountCoupon) => {
    useLoading()
    $receiveDiscountCoupon({
      couponId: item.id,
      couponScene: options?.scene ?? DiscountCouponScene.goodsDetail,
      goodsId: options?.goodsId,
      goodsGroupId: options?.goodsGroupId
    })
      .then(res => {
        useResponseMessage(res)
      })
      .catch(err => {
        useResponseMessage(err)
      })
      .finally(() => {
        useLoadingEnd()
        refreshDataItem(item.id)
        // refreshData({ silent: true })
      })
  })

  const onUse = (item: IDiscountCoupon) => {
    navigateToCouponUsage({
      recordNo: item.recordNo
    })
  }

  const valid = (item: IDiscountCoupon) => {
    const { useType, useStartTime, useEndTime, limitedDays } = item

    if (useType === couponUseTimeRangeType.timeRange) {
      return `有效期至 ${dayjs(useEndTime).format('YYYY.MM.DD')}`
    }

    return `自领取后 ${limitedDays} 天内可用`
  }

  const tips = (item: IDiscountCoupon) => {
    const start = dayjs(item.useStartTime)
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

  const modal = useModal({
    title: '优惠活动',
    height: 'auto',
    content: () => {
      return (
        <div class="use-receive-coupon-modal">
          {data.value.map(item => {
            return (
              <CouponItem
                name={item.name}
                amount={item.discountAmount / 100}
                threshold={item.thresholdAmount / 100}
                useRules={item.instructions}
                validDateText={valid(item)}
                scope={item.scope}
                tips={tips(item)}
                stamp={item.hasRecord ? '已领取' : undefined}
                stampSize="small"
                button={() => {
                  if (item.hasRecord && !(item.receiveLimit > 0)) {
                    return (
                      <CouponItemButton
                        text="去使用"
                        centered
                        onClick={() => {
                          onUse(item)
                        }}
                      ></CouponItemButton>
                    )
                  }
                  return (
                    <div style={'margin: auto 0;'}>
                      <CouponItemButton
                        text={'领取'}
                        primary
                        onClick={() => {
                          onReceive(item)
                        }}
                      ></CouponItemButton>
                      {item.hasRecord && (
                        <div class="use-receive-coupon-modal__continue-tips">还可领 {item.receiveLimit} 张</div>
                      )}
                    </div>
                  )
                }}
              />
            )
          })}
          <CommonPaginationStatus />
        </div>
      )
    }
  })

  return modal
}

export default useReceiveCoupon

export const ReceiveCouponModalContent = defineComponent({
  name: 'ReceiveCouponModalContent',
  setup(props) {
    return () => {
      return (
        <div class="receive-coupon-modal-content">
          <div class="modal-title">优惠</div>
          <EmptyStatus description="当前暂无优惠活动" />
        </div>
      )
    }
  }
})
