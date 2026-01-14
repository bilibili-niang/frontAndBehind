import {
  EmptyStatus,
  useLoading,
  useLoadingEnd,
  useModal,
  useModalActions,
  usePagination,
  useResponseMessage,
  useToast
} from '@anteng/core'
import { ShopList } from '../../../../components/suitable-shops'
import { computed, ref, shallowRef } from 'vue'
import ShopItem from '../../../../components/shop-item'
import './useCouponAudit.scss'
import CountStepper from '../../../../components/count-stepper'
import { getGoodsOrderDetail } from '../../../../api'
import { IOrderDetail } from '../../../../api/order/types'
import { $getCouponAuditRecords, $postAuditDynamicCoupon, $postAuditStaticCoupon } from '../../../../api/coupon'
import { ModalActions } from '@anteng/core/src/hooks/useModal/useModalActions'
import OrderGoodsItem from '../../../../components/order-goods-item'
import { STORE_COUPON_MODE_DYNAMIC, STORE_COUPON_MODE_STATIC } from '@pkg/shared/constants'

export const useCouponAudit = async (options: {
  goodsId: string
  mainOrderNo: string
  subOrderNo: string
  cardNo: string
  count?: number
  onSuccess?: (payload: any) => void
  onFail?: (error: any) => void
}) => {
  const orderDetailRef = shallowRef<IOrderDetail>()
  try {
    useLoading()
    orderDetailRef.value = (await getGoodsOrderDetail(options.mainOrderNo)).data
  } catch (err) {
    useResponseMessage(err)
  } finally {
    useLoadingEnd()
  }

  const targetSubOrder = computed(() => {
    return orderDetailRef.value?.subOrders.find(item => item.orderNo === options.subOrderNo)
  })

  const targetCard = computed(() => {
    return targetSubOrder.value?.coupons?.find(item => item.cardNo === options.cardNo)
  })

  if (!targetCard.value) {
    return options.onFail?.(new Error('找不到卡券信息'))
  }

  const { Actions: Step1Actions } = useModalActions([
    {
      text: '取消',
      onClick: () => {
        modal.close()
      }
    },
    {
      text: '下一步',
      primary: true,
      onClick: () => {
        if (!shopItem.value) {
          useToast('请选择核销门店')
          return void 0
        }
        console.log(shopItem.value)
        stepRef.value = 2
        countRef.value = 1
        countDownSeconds.value = 3
        countDown()
      }
    }
  ])

  const shopItem = shallowRef()

  const Step1 = () => {
    if (!targetCard.value) {
      return (
        <div>
          <EmptyStatus title="出错了" description="找不到卡券信息" />
        </div>
      )
    }
    return (
      <div>
        <ShopList
          asSelector
          goodsId={options.goodsId}
          selectedShopId={shopItem.value?.id}
          onSelect={v => (shopItem.value = v)}
        />
        <Step1Actions />
      </div>
    )
  }

  const auditLoading = ref(false)

  const { Actions: Step2Actions } = useModalActions(
    computed<ModalActions>(() => [
      {
        text: '上一步',
        onClick: () => {
          stepRef.value = 1
        }
      },
      {
        text: countDownSeconds.value > 0 ? `确定核销（${countDownSeconds.value}s）` : '确定核销',
        primary: true,
        loading: auditLoading.value,
        disabled: countDownSeconds.value > 0,
        onClick: async () => {
          if (!shopItem.value) {
            useToast('请选择核销门店')
            stepRef.value = 1
            return Promise.reject(false)
          }

          console.log(targetCard.value)

          auditLoading.value = true
          if (targetCard.value.qrcodeType === STORE_COUPON_MODE_DYNAMIC) {
            $postAuditDynamicCoupon({
              // password: targetCard.value.password,
              verificationCode: targetSubOrder.value!.verificationCode,
              storeId: shopItem.value.id,
              storeName: shopItem.value.name,
              number: countRef.value
            })
              .then(res => {
                if (res.code === 200) {
                  modal.close()
                  options.onSuccess?.(res.data)
                  useResponseMessage(res, '核销成功')
                } else {
                  useResponseMessage(res, '核销失败')
                }
              })
              .catch(err => {
                useResponseMessage(err, '核销失败')
              })
              .finally(() => {
                auditLoading.value = false
              })
          } else if (targetCard.value.qrcodeType === STORE_COUPON_MODE_STATIC) {
            $postAuditStaticCoupon({
              // password: targetCard.value.password,
              // recordNo: targetCard.value.recordNo,
              storeId: shopItem.value.id,
              storeName: shopItem.value.name,
              // orderNo: orderDetailRef.value!.orderNo,
              orderNo: targetSubOrder.value!.orderNo,
              number: countRef.value
            })
              .then(res => {
                if (res.code === 200) {
                  modal.close()
                  options.onSuccess?.(res.data)
                  useResponseMessage(res, '核销成功')
                } else {
                  useResponseMessage(res, '核销失败')
                }
              })
              .catch(err => {
                useResponseMessage(err, '核销失败')
              })
              .finally(() => {
                auditLoading.value = false
              })
          } else {
            useToast(`卡券类型错误：${targetCard.value.qrcodeType}`)
          }
        }
      }
    ])
  )

  const countDownSeconds = ref(3)
  const countDown = () => {
    setTimeout(() => {
      countDownSeconds.value--
      if (countDownSeconds.value > 0) {
        countDown()
      }
    }, 1000)
  }

  const countRef = ref(1)
  const Step2 = () => (
    <div>
      <ShopItem class="coupon-audit-confirm-shop" {...shopItem.value} />
      <div class="coupon-audit-confirm-content">
        <div class="item">
          <div class="label">商品名称</div>
          <div class="value">{targetSubOrder.value?.goodsName}</div>
        </div>
        <div class="item">
          <div class="label">规格</div>
          <div class="value">{targetSubOrder.value?.goodsStockSnapshot.specs.map(spec => spec.v).join('／')}</div>
        </div>
        <div class="item">
          <div class="label">核销数量</div>
          <div class="value count">
            <CountStepper
              style="margin-right:-4px;margin-top:-8px;"
              min={1}
              max={options.count}
              maxMessage="不可超过待使用数量"
              value={countRef.value}
              onChange={v => {
                countRef.value = v
              }}
            />
            {options.count! > 0 && (
              <div class="count-tip">
                共有<div class="color-primary number-font">&nbsp;{options.count}&nbsp;</div>张待使用券码
              </div>
            )}
          </div>
        </div>
        <div class="item">
          <div class="label">使用门店</div>
          <div class="value">{shopItem.value?.name}</div>
        </div>
      </div>
      <div class="coupon-audit-confirm-alert">请仔细核对信息，卡券一经核销不可撤回。</div>
      <Step2Actions />
    </div>
  )

  const stepRef = ref(1)

  const modal = useModal({
    title: () => (stepRef.value === 1 ? '选择核销门店' : '核销确认'),
    padding: 0,
    content: () => {
      if (stepRef.value === 1) {
        return <Step1 />
      }
      if (stepRef.value === 2) {
        return <Step2 />
      }
    },
    height: 600
  })
}

export const useCouponAuditRecords = async (orderNo: string) => {
  const { fetchData, data, Empty, Loading, EndTip, ErrorStatus } = usePagination({
    requestHandler: () => {
      return $getCouponAuditRecords(orderNo)
    }
  })

  fetchData()

  useModal({
    title: '订单卡券核销记录',
    content: () => {
      return (
        <div>
          {data.value.map(item => {
            const Info = (
              <div class="coupon-audit-record__info">
                <div class="item">
                  <div class="label">卡券编码：</div>
                  <div class="value">{item.cardNo}</div>
                </div>
                <div class="item">
                  <div class="label">核销门店：</div>
                  <div class="value">{item.storeName}</div>
                </div>
                <div class="item">
                  <div class="label">核销时间：</div>
                  <div class="value">{item.createTime}</div>
                </div>
                {item.assistantName && (
                  <div class="item">
                    <div class="label">店员名称：</div>
                    <div class="value">{item.assistantName}</div>
                  </div>
                )}
                {item.assistantPhone && (
                  <div class="item">
                    <div class="label">店员手机：</div>
                    <div class="value">{item.assistantPhone}</div>
                  </div>
                )}
              </div>
            )
            return (
              <div class="coupon-audit-record">
                <OrderGoodsItem
                  image={item.goodsImages?.[0]}
                  name={item.goodsName}
                  spec={item.goodsStockName}
                  // desc={Info}
                  // unitPrice={0}
                  // unitPricePaid={0}
                  count={1}
                />
                {Info}
              </div>
            )
          })}
          <ErrorStatus />
          <Empty />
          <Loading />
          <EndTip />
        </div>
      )
    }
  })
}
