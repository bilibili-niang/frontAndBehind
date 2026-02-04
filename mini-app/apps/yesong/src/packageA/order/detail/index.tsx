import { BasePage, emitter, EmptyStatus, onPageShow, useCopyText, useCountdown, useResponseMessage } from '@pkg/core'
import { computed, defineComponent, onUnmounted, ref } from 'vue'
import './style.scss'
import { useRouter } from '@tarojs/taro'
import { getGoodsOrderDetail } from '../../../api/order'
import AddressSelector from '../pay/address-selector'
import Skeleton from './skeleton'
import {
  GOODS_TYPE_ENTITY,
  GOODS_TYPE_STORE_VERIFICATION,
  ORDER_PAYMENT_STATUS_PENDING,
  ORDER_STATUS_OPTIONS,
  PAYMENT_CHANNEL_BALANCE,
  PAYMENT_CHANNEL_OPTIONS
} from '../../../constants'
import { navigateToAfterSaleResult, navigateToGoodsDetail } from '../../../router'
import { Icon } from '@pkg/ui'
import ActionBar from './action-bar'
import Express from './express'
import useMerchantStore from '../../../stores/merchant'
import { EMITTER_ORDER_REFRESH } from '../../../utils/emitter'
import Coupon from './coupon'
import OrderGoodsItem, { OrderGoodsItemAction } from '../../../components/order-goods-item'
import { ISubOrder } from '../../../api/order/types'
import useAfterSale from '../after-sale/useAfterSale'
import { clamp } from 'lodash-es'
import dayjs from 'dayjs'
import {
  ORDER_AFTER_SALES_STATUS_OPTIONS,
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_CLOSED,
  ORDER_STATUS_COMPLETED,
  ORDER_STATUS_PENDING_PAYMENT
} from '../../../constants/order'
import { formatPrice } from '@pkg/utils'

definePageConfig({
  navigationStyle: 'custom'
})

export default defineComponent({
  name: '',
  setup() {
    const orderNo = useRouter().params.orderNo
    const detailRef = ref<any>(null)
    const isLoading = ref(false)
    const getDetail = () => {
      if (isLoading.value) return void 0
      isLoading.value = true
      getGoodsOrderDetail(orderNo!)
        .then(res => {
          if (res.code === 200) {
            detailRef.value = res.data
          } else {
            useResponseMessage(res)
          }
        })
        .catch(useResponseMessage)
        .finally(() => {
          isLoading.value = false
        })
    }

    getDetail()
    onPageShow(() => {
      getDetail()
    })

    /** 监听外部订单操作需要触发数据刷新 */
    const onRefresh = (orderId: string) => {
      if (detailRef.value?.id !== orderId) return void 0
      getDetail()
    }
    emitter.on(EMITTER_ORDER_REFRESH, onRefresh)
    onUnmounted(() => {
      emitter.off(EMITTER_ORDER_REFRESH, onRefresh)
    })

    const headerVisible = computed(() => {
      return detailRef.value?.subOrders[0]?.type != GOODS_TYPE_STORE_VERIFICATION
    })

    const merchantStore = useMerchantStore()
    const paymentEndTime = computed(() => merchantStore.calcPaymentEndTime(detailRef.value?.createTime))
    const { countdownTime } = useCountdown(paymentEndTime)

    const statusRef = computed(() => {
      const status = detailRef.value.status
      const title = ORDER_STATUS_OPTIONS(detailRef.value.subOrders?.[0]?.type).find(
        item => item.value === status
      )?.label
      let subtitle: any = ''

      if (status === ORDER_PAYMENT_STATUS_PENDING) {
        subtitle = (
          <div>
            订单在 <span class="color-error number-font">{countdownTime.value}</span> 后将自动关闭，请尽快付款哦～
          </div>
        )
      } else {
        subtitle = ORDER_STATUS_OPTIONS(detailRef.value.subOrders?.[0]?.type).find(
          item => item.value === status
        )?.description
      }

      return {
        title: title,
        subtitle: subtitle
      }
    })

    const address = computed(() => {
      if (!detailRef.value) return undefined

      const entityOrder = detailRef.value.subOrders.find(item => item.type === GOODS_TYPE_ENTITY)

      if (!entityOrder) return null

      const { contactProvince, contactCity, contactDistrict, contactAddress, contactName, contactMobile } =
        entityOrder ?? {}
      return {
        provinceName: contactProvince,
        cityName: contactCity,
        countyName: contactDistrict,
        detailInfo: contactAddress,
        userName: contactName,
        telNumber: contactMobile
      }
    })

    const extractExpresses = (detail: any) => {
      const list: any[] = []
      detail.subOrders.forEach(order => {
        // 使用逗号分割快递公司名称和快递单号
        const courierNames = order.courierName?.split(',') ?? ['']
        const courierNumbers = order.courierNo?.split(',') ?? ['']

        const goods = {
          id: order.id,
          goodsId: order.goodsId,
          name: order.goodsName,
          image: order.goodsStockSnapshot?.specs?.[0]?.image ?? order.goodsSnapshot?.coverImages?.[0]
        }

        // 创建一个对象数组，每个对象包含快递公司名称和对应的快递单号
        courierNumbers.forEach((no, index) => {
          const target = list.find(item => item.courierNo === no)
          if (target) {
            target.goodsList.push(goods)
          } else {
            list.push({
              courierName: courierNames[index].trim(),
              courierNo: no.trim(),
              remark: order.courierRemark,
              goodsList: [goods]
            })
          }
        })
      })
      return list
    }
    const ExpressRef = computed(() => {
      if (!address.value) return null
      const packs = extractExpresses(detailRef.value)
      if (packs.filter(item => item.courierNo).length > 0) {
        return <Express packs={packs} address={address.value} />
      }
      // 未发货（没有快递单号）时，显示地址，否则显示物流。
      return <AddressSelector address={address.value} readonly />
    })

    /** 结算明细是否折叠 */
    const isBillFold = ref(true)

    /** 是否可申请售后，这个不应该在前端计算... */
    const afterSaleApplicable = computed(() => {
      // 未付款、已取消、已关闭，不显示【售后按钮】
      if (
        [ORDER_STATUS_PENDING_PAYMENT, ORDER_STATUS_CLOSED, ORDER_STATUS_CANCELLED].includes(detailRef.value.status)
      ) {
        return false
      }

      // 【订单状态=已完成】
      if (detailRef.value.status === ORDER_STATUS_COMPLETED) {
        const merchantOrderFlow = merchantStore.merchantOrderFlow

        // &【订单流程设置中-订单完成允许售后 = 不允许】时，不显示【售后按钮】
        if (merchantOrderFlow?.afterSales === 1) {
          return false
        }

        const d = merchantOrderFlow?.complete
        if (!d) return false
        // 订单超出售后天数时，不显示【售后按钮】
        if (dayjs().isAfter(dayjs(detailRef.value.completedTime).add(d, 'day'))) {
          return false
        }
      }

      return true
    })

    const subOrders = computed(() => {
      return detailRef.value.subOrders.map((item: ISubOrder) => {
        return {
          ...item,
          $status: item.afterSaleOrderNo
            ? ORDER_AFTER_SALES_STATUS_OPTIONS.find(i => i.value == item.afterSaleOrderStatus)?.label || '售后中'
            : '',
          $actions: () => [
            detailRef.value.payStatus !== ORDER_PAYMENT_STATUS_PENDING &&
              (item.afterSaleOrderNo ? (
                <OrderGoodsItemAction
                  onClick={() => {
                    navigateToAfterSaleResult(item.afterSaleOrderNo)
                  }}
                >
                  售后进度
                  <Icon name="right" />
                </OrderGoodsItemAction>
              ) : (
                afterSaleApplicable.value && (
                  <OrderGoodsItemAction
                    onClick={() => {
                      useAfterSale({ mainOrderNo: detailRef.value.orderNo, orderNo: item.orderNo })
                    }}
                  >
                    售后申请
                  </OrderGoodsItemAction>
                )
              ))
          ]
        }
      })
    })

    const paymentMode = computed(() => {
      const channels = detailRef.value.paymentChannelInfos?.map(item => {
        return {
          label: PAYMENT_CHANNEL_OPTIONS.find(o => o.value === item.paymentChannel)?.label || item.paymentChannel,
          value: clamp(item.totalAmount / 100, 0, Infinity)
        }
      })
      return (channels || ['微信支付']).map(item => item.label ?? item).join(' ＋ ')
    })

    const balanceAmount = computed(() => {
      const v = detailRef.value.paymentChannelInfos?.find(
        item => item.paymentChannel === PAYMENT_CHANNEL_BALANCE
      )?.totalAmount
      return v > 0 ? v : 0
    })

    const payAmount = computed(() => {
      return detailRef.value.payAmount - balanceAmount.value
    })

    const discountCoupon = computed(() => {
      const coupons = detailRef.value.discountCoupon
      if (!(coupons?.length > 0)) {
        return {
          amount: 0,
          coupons: []
        }
      }

      return {
        amount: coupons.reduce((v, item) => {
          return v + (item.discountAmount ?? 0)
        }, 0),
        coupons
      }
    })

    const formatCouponText = (item: any) => {
      const v = formatPrice(item.discountAmount / 100)
      if (item.thresholdAmount > 0) {
        return (
          <div class="coupon-item number-font">
            满 {formatPrice(item.thresholdAmount / 100)} 减 {v}
          </div>
        )
      } else if (item.thresholdAmount === 0) {
        return <div class="coupon-item">{v} 元无门槛</div>
      }
      return <div class="coupon-item">{v} 元券</div>
    }

    return () => {
      return (
        <BasePage
          navigator={{
            title: '订单详情'
          }}
        >
          {isLoading.value ? (
            <Skeleton />
          ) : !detailRef.value ? (
            <EmptyStatus description="找不到订单" />
          ) : (
            <div class="order-detail-page">
              {headerVisible.value && (
                <div class="order-detail__header">
                  <div class="title">{statusRef.value.title}</div>
                  <div class="subtitle">{statusRef.value.subtitle}</div>
                </div>
              )}
              <div class="order-detail__content">
                {ExpressRef.value}
                <Coupon orderDetail={detailRef.value} onRefresh={getDetail} />
                <div class="order-detail__goods">
                  {subOrders.value.map(item => {
                    return (
                      <OrderGoodsItem
                        image={item.goodsStockSnapshot?.specs?.[0]?.image ?? item.goodsSnapshot?.coverImages?.[0]}
                        name={item.goodsName}
                        spec={item.goodsStockSnapshot.specs.map(spec => spec.v).join('／')}
                        unitPrice={item.priceText}
                        unitPricePaid={item.$payUnitAmountText}
                        count={item.count}
                        status={item.$status}
                        actions={item.$actions}
                        onClick={() => {
                          navigateToGoodsDetail(item.goodsId)
                        }}
                      />
                    )
                  })}
                  {!isBillFold.value && (
                    <div class="order-detail__bill">
                      <div class="info-item">
                        <div class="label">商品总价</div>
                        <div class="value number-font">
                          <div class="yen">&yen;</div>
                          {detailRef.value.amountText}
                        </div>
                      </div>
                      <div class="info-item">
                        <div class="label">商品优惠</div>
                        {discountCoupon.value.amount > 0 ? (
                          <div class="value primary number-font">
                            <div style="font-weight:normal;font-size:0.8em;">减</div>
                            &nbsp;
                            <div class="yen">&yen;</div>
                            {(discountCoupon.value.amount / 100).toFixed(2)}
                          </div>
                        ) : (
                          <div class="value secondary">未使用优惠</div>
                        )}
                      </div>
                      {discountCoupon.value.amount > 0 && (
                        <div class="discount-coupon-use-details">
                          {discountCoupon.value.coupons.map(item => {
                            return (
                              <div class="coupon-item">
                                <div class="name">{item.name}</div>
                                <div class="text">{formatCouponText(item)}</div>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {balanceAmount.value > 0 && (
                        <div class="info-item">
                          <div class="label">余额抵扣</div>
                          <div class="value primary number-font">
                            <div style="font-weight:normal;font-size:0.8em;">减</div>
                            &nbsp;
                            <div class="yen">&yen;</div>
                            {(balanceAmount.value / 100).toFixed(2)}
                          </div>
                        </div>
                      )}
                      <div class="info-item">
                        <div class="label">运费</div>
                        <div class="value secondary">
                          {detailRef.value.freightAmount > 0 ? detailRef.value.freightAmountText : '免运费'}
                        </div>
                      </div>
                    </div>
                  )}
                  <div
                    class="order-detail__summary"
                    onClick={() => {
                      isBillFold.value = !isBillFold.value
                    }}
                  >
                    <div class="order-detail__pay-amount number-font">
                      {detailRef.value.payStatus === ORDER_PAYMENT_STATUS_PENDING ? '需付款' : '实付款'}
                      <div class="yen">&yen;&nbsp;</div>
                      <div class="value">{(payAmount.value / 100).toFixed(2)}</div>
                    </div>
                    <Icon name="down" class={!isBillFold.value && 'up'} />
                  </div>
                </div>
                <div class="order-detail__info">
                  <div class="main-title">订单信息</div>
                  <div
                    class="info-item"
                    onClick={() => {
                      useCopyText(detailRef.value.orderNo)
                    }}
                  >
                    <div class="label">订单编号</div>
                    <div class="value">
                      {detailRef.value.orderNo}
                      <div class="copy-btn">复制</div>
                    </div>
                  </div>
                  <div class="info-item">
                    <div class="label">订单备注</div>
                    <div class="value color-disabled">无备注</div>
                  </div>
                  <div class="info-item">
                    <div class="label">支付方式</div>
                    <div class="value">{paymentMode.value}</div>
                  </div>
                  <div class="info-item">
                    <div class="label">下单时间</div>
                    <div class="value">{detailRef.value.createTime}</div>
                  </div>
                  <div class="info-item">
                    <div class="label">支付时间</div>
                    <div class="value">{detailRef.value.payTime ?? '—'}</div>
                  </div>
                </div>
              </div>
              <ActionBar orderDetail={detailRef.value} />
            </div>
          )}
        </BasePage>
      )
    }
  }
})
