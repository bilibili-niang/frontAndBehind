import { computed, defineComponent, PropType, ref, watch } from 'vue'
import './style.scss'
import { IOrderDetail } from '../../../../api/order/types'
import { Icon, QRCode } from '@pkg/ui'
import MustKnow from '../../../goods/detail/must-know'
import { useCopyText, useToast } from '@pkg/core'
import { COUPON_STATUS_OPTIONS, COUPON_STATUS_PENDING_USE, COUPON_VALID_TYPE_DAYS } from '../../../../constants'
import Taro from '@tarojs/taro'
import { useCouponAudit, useCouponAuditRecords } from './useCouponAudit'

type AuditCoupon = IOrderDetail['coupons'][number] & { goodsId: string; orderNo: string }

export default defineComponent({
  name: 'OrderCoupons',
  props: {
    orderDetail: {
      type: Object as PropType<IOrderDetail>,
      required: true
    }
  },
  emits: {
    refresh: () => true
  },
  setup(props, { emit }) {
    const coupons = computed(() => {
      if (!props.orderDetail) return []
      return props.orderDetail.subOrders.reduce((list, item) => {
        if (Array.isArray(item.coupons)) {
          list.push(
            ...item.coupons.map(coupon => {
              return {
                goodsId: item.goodsId,
                orderNo: item.orderNo,
                ...coupon
              }
            })
          )
        }
        return list
      }, [] as AuditCoupon[])
    })

    const targetSuborder = computed(() => props.orderDetail.subOrders[0])

    const useableCount = computed(() => {
      return coupons.value.filter(item => {
        return item.status === COUPON_STATUS_PENDING_USE
      }).length
    })

    const currentIndex = ref(0)

    const currentCouppon = computed(() => coupons.value[currentIndex.value])

    // 自动滑动切换到可使用的卡券
    const scrollToUseableItem = () => {
      const index = coupons.value.findIndex(item => {
        return item.status === COUPON_STATUS_PENDING_USE
      })
      if (index > -1) {
        currentIndex.value = index
      }
    }

    watch(
      () => coupons.value,
      () => {
        scrollToUseableItem()
      },
      { immediate: true }
    )

    /** 当前卡券有效期文本 */
    const validDateText = computed(() => {
      if (!currentCouppon.value) return null
      const { expireType, expireEndAt, expireStartAt } = currentCouppon.value
      if (expireType === COUPON_VALID_TYPE_DAYS) {
        return `有效期至：${expireEndAt}`
      }
      return `有效期：${expireStartAt} 至 ${expireEndAt}`
    })

    const statusText = computed(() => {
      if (!currentCouppon.value) return null
      return (
        COUPON_STATUS_OPTIONS.find(item => String(item.value) === String(currentCouppon.value.status))?.label ??
        '状态异常'
      )
    })

    const indicatorTipVisible = ref(Boolean(!Taro.getStorageSync('coupons-indicator-tip')))
    const IndicatorTip = () => {
      if (!(coupons.value.length > 1)) {
        return null
      }
      if (indicatorTipVisible.value) {
        return <div class="order-coupons__indicator-tip">包含 {coupons.value.length} 张卡券，请滑动切换查看</div>
      }
      return null
    }

    const closeIndicatorTip = () => {
      if (indicatorTipVisible.value) {
        indicatorTipVisible.value = false
        Taro.setStorageSync('coupons-indicator-tip', 'true')
      }
    }

    const onAudit = (item?: (typeof coupons.value)[number]) => {
      if (!item) {
        scrollToUseableItem()
        if (currentCouppon.value) {
          onAudit(currentCouppon.value)
        } else {
          useToast('无可使用卡券')
        }
        return void 0
      }
      useCouponAudit({
        goodsId: item.goodsId,
        mainOrderNo: props.orderDetail.orderNo,
        subOrderNo: item.orderNo,
        cardNo: item.cardNo,
        count: useableCount.value,
        onSuccess(payload) {
          emit('refresh')
        }
      })
    }

    return () => {
      if (coupons.value.length === 0) {
        return null
      }
      const item = coupons.value.find(item => item.status === COUPON_STATUS_PENDING_USE) || coupons.value[0]
      return (
        <>
          {useableCount.value > 0 && (
            <div class="order-coupons-summary">
              <div class="status-text">
                待使用券码<div class="color-primary number-font">&nbsp;{useableCount.value}&nbsp;张</div>
                {/* <div
                  class="audit-button"
                  onClick={() => {
                    onAudit()
                  }}
                >
                  立即核销
                  <Icon name="right" />
                </div> */}
              </div>
              {/* <div class="valid-date">请在 {coupons.value[0]?.expireEndAt || '过期时间'} 之前使用</div> */}
            </div>
          )}
          <div class="order-coupons">
            <div class="order-coupons__header">
              <div class="title">
                <div>商品券码</div>
                <div class="status">{statusText.value}</div>
              </div>
              <div class="valid-date">{validDateText.value}</div>
            </div>
            <div class="order-coupons__content">
              <div class="order-coupons__tooltip">到店出示二维码使用</div>
              <div class={['order-coupon-item', item.status === COUPON_STATUS_PENDING_USE && 'useable']}>
                <div class="order-coupon-item__qr">
                  {targetSuborder.value.verificationCode ? (
                    <QRCode content={targetSuborder.value.verificationCode} />
                  ) : (
                    '无效券码'
                  )}
                  <div class="order-coupon-item__stamp-wrap">
                    <div class="order-coupon-item__stamp">{statusText.value}</div>
                  </div>
                </div>
                <div class="order-coupon-item__code">
                  券码&emsp;<div class="order-coupon-item__code-content">{targetSuborder.value.verificationCode}</div>
                  &emsp;
                  <div
                    class="copy"
                    onClick={() => {
                      useCopyText(targetSuborder.value.verificationCode)
                    }}
                  >
                    复制
                  </div>
                </div>
                <div class="order-coupon-item__actions">
                  <div
                    class="action"
                    onClick={() => {
                      useCouponAuditRecords(targetSuborder.value.orderNo)
                    }}
                  >
                    核销记录&nbsp;
                    <Icon name="right" />
                  </div>
                  {item.status === COUPON_STATUS_PENDING_USE && (
                    <div
                      class="action primary"
                      onClick={() => {
                        onAudit(item)
                      }}
                    >
                      立即核销&nbsp;
                      <Icon name="right" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <MustKnow class="must-know" goodsDetail={props.orderDetail.subOrders[0].goodsSnapshot as any} />
          </div>
        </>
      )
    }
  }
})
