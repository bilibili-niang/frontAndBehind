import { ComputedValue, useComputedValue, useModal, useModalActions, usePagination } from '@anteng/core'
import './style.scss'
import { OrderPayGoodsItem } from '../store'
import CouponItem from '../../../discount-coupon/components/coupon-item'
import { Radio } from '@anteng/ui'
import { computed, ref, watch } from 'vue'
import { $getOrderUseableDiscountCouponList } from '../../../../api/discount-coupon'
import { formatPrice } from '@anteng/utils'

export const useOrderCouponSelector = (items: ComputedValue<OrderPayGoodsItem[]>) => {
  const itemsRef = useComputedValue(items)

  const {
    data: coupons,
    refreshData,
    CommonPaginationStatus
  } = usePagination({
    requestHandler: params => {
      return $getOrderUseableDiscountCouponList({
        ...params,
        size: 1000,
        items: itemsRef.value
      })
    }
  })

  watch(
    () => itemsRef.value,
    () => {
      if (itemsRef.value.length > 0) {
        refreshData({
          //  clearDataImmediate: true
        })
      }
    },
    {
      deep: true,
      immediate: true
    }
  )

  const current = ref<string>('')
  const currentCoupon = computed(() => {
    return coupons.value.find(item => item.recordNo === current.value)
  })
  const onSelect = (recordNo: string) => {
    current.value = current.value === recordNo ? '' : recordNo
  }

  watch(
    () => coupons.value,
    () => {
      if (!currentCoupon.value) {
        current.value = ''
      }
    }
  )

  const discountAmountText = computed(() => {
    if (!currentCoupon.value) return ''
    return formatPrice(currentCoupon.value.discountAmount / 100)
  })

  const showModal = () => {
    const { Actions } = useModalActions(
      [
        {
          text: () => (currentCoupon.value ? '确定使用' : '确定'),
          primary: true,
          onClick: () => {
            modal.close()
          }
        }
      ],
      {
        prepend: () => {
          if (!currentCoupon.value) return null
          return (
            <div class="use-order-coupon-selector__tips">
              您已选择<div class="value">&nbsp;1&nbsp;</div>张优惠券，最高可抵&nbsp;
              <div class="value"> &yen;{discountAmountText.value}</div>
            </div>
          )
        }
      }
    )

    const modal = useModal({
      height: 'auto',
      title: () => {
        return (
          <div class="use-order-coupon-selector__title">
            <div class="item active">可用优惠券</div>
            {/* <div class="item">不可用优惠券</div> */}
          </div>
        )
      },
      content: () => {
        return (
          <div class="use-order-coupon-selector">
            <div class="use-order-coupon-selector__content">
              {coupons.value.map((item, index) => {
                return (
                  <CouponItem
                    name={item.name}
                    amount={item.discountAmount / 100}
                    threshold={item.thresholdAmount / 100}
                    scope={item.scope}
                    validDate={item.useEndTime}
                    onClick={() => {
                      onSelect(item.recordNo)
                    }}
                    button={() => {
                      return <Radio style="margin: auto 0;" checked={item.recordNo === current.value} />
                    }}
                  />
                )
              })}
              <CommonPaginationStatus />
            </div>
            <Actions />
          </div>
        )
      }
    })
  }

  const SelectCouponButton = () => {
    if (coupons.value.length === 0) {
      return (
        <div class="color-disabled" onClick={showModal}>
          无可用
        </div>
      )
    }

    if (currentCoupon.value) {
      return (
        <div class="use-order-coupon-selector__selected" onClick={showModal}>
          <div class="amount number-font">－&yen;{discountAmountText.value}</div>
          <div class="name">{currentCoupon.value.name}</div>
        </div>
      )
    }

    return (
      <div class="use-order-coupon-selector__entrance color-disabled" onClick={showModal}>
        共&nbsp;<div class="useable-count">{coupons.value.length}</div>&nbsp;张券可用
      </div>
    )
  }

  return {
    onSelect,
    currentCoupon,
    SelectCouponButton
  }
}
