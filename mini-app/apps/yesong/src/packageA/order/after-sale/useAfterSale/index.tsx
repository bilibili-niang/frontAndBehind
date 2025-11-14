import { useLoading, useLoadingEnd, useModal, useResponseMessage, useToast } from '@anteng/core'
import { computed, defineComponent, ref, withModifiers } from 'vue'
import './style.scss'
import { getGoodsOrderDetail } from '../../../../api'
import { IOrderDetail } from '../../../../api/order/types'
import { Icon, Radio } from '@anteng/ui'
import GoodsItem from '../../../../components/goods-item'
import { Image, ScrollView, Swiper, SwiperItem } from '@tarojs/components'
import { navigateToAfterSale, navigateToAfterSaleResult } from '../../../../router'
import useMerchantStore from '../../../../stores/merchant'
import { storeToRefs } from 'pinia'
import { GOODS_TYPE_ENTITY, SUB_ORDER_STATUS_PENDING_SHIPMENT } from '../../../../constants'
import { watch } from 'vue'

const AFTER_SALE_TYPE_REFUND = 2
const AFTER_SALE_TYPE_REFUND_ONLY = 1
const AFTER_SALE_TYPE_OPTIONS = [
  { label: '退货退款', value: AFTER_SALE_TYPE_REFUND },
  { label: '仅退款', value: AFTER_SALE_TYPE_REFUND_ONLY }
]

export interface IUseAfterSaleOptions {
  /** 主订单号 */
  mainOrderNo: string
  /** 子订单号，若不传入需要用户手动选择，(若该订单只有一个子订单，将自动选中，可忽略该值) */
  orderNo?: string
}

/** 申请售后 */
const useAfterSale = async (options: IUseAfterSaleOptions) => {
  const mainOrderNo = options.mainOrderNo

  if (!mainOrderNo) return useToast('主订单号缺失')
  const orderDetailRef = ref<IOrderDetail>()
  try {
    useLoading()
    const res = await getGoodsOrderDetail(mainOrderNo)
    if (res.code === 200) {
      orderDetailRef.value = res.data
    } else {
      useResponseMessage(res)
      return Promise.reject(new Error(res.msg))
    }
  } catch (err) {
    useResponseMessage(err)
    return Promise.reject(err)
  }

  useLoadingEnd()

  const modal = useModal({
    title: () => <ModalTitle />,
    content: () => <ChooseTypeAndGoods />,
    height: 600,
    scrollViewDisabled: true,
    padding: 0
  })

  const step = ref(0)
  const steps = ['选择商品', '选择原因', '确认信息']
  const ModalTitle = () => {
    return (
      <div class="after-sale-step-title">
        {steps.map((text, index, arr) => {
          return (
            <>
              <span class={['label', step.value === index ? 'active' : step.value > index ? 'fulfill' : null]}>
                {text}
              </span>
              {index < arr.length - 1 && <Icon name="flow-arrow" class={step.value > index && 'fulfill'} />}
            </>
          )
        })}
      </div>
    )
  }

  /** 切换到步骤1 */
  const toggleStep1 = () => {
    step.value = 0
    modal.update({
      content: () => <ChooseTypeAndGoods />,
      height: 600
    })
  }

  /** 切换到步骤2 */
  const toggleStep2 = () => {
    step.value = 1
    useMerchantStore().getMerchantOrderFlow()
    modal.update({
      content: () => <ChooseReason />,
      height: 600
    })
  }

  const type = ref(AFTER_SALE_TYPE_REFUND)

  /** 是否允许多选 */
  const MULTIPLE = false

  const checkedOrders = ref<string[]>(options.orderNo ? [options.orderNo] : [])
  const checkOrder = (order: IOrderDetail['subOrders'][number]) => {
    if (order.afterSaleOrderNo) {
      useToast('该订单已在售后流程中')
      return void 0
    }
    const index = checkedOrders.value.indexOf(order.orderNo)
    if (index !== -1) {
      checkedOrders.value.splice(index, 1)
    } else {
      if (MULTIPLE) {
        checkedOrders.value.push(order.orderNo)
      } else {
        checkedOrders.value = [order.orderNo]
      }
    }
  }

  const typeOptions = computed(() => {
    const target = orderDetailRef.value?.subOrders.find(item => item.orderNo === checkedOrders.value[0])

    if (target?.type === GOODS_TYPE_ENTITY) {
      // 未发货时，只可仅退款
      if (target.status === SUB_ORDER_STATUS_PENDING_SHIPMENT) {
        return [AFTER_SALE_TYPE_OPTIONS[1]]
      }

      // 实物订单才可退货退款
      return AFTER_SALE_TYPE_OPTIONS
    }

    return [AFTER_SALE_TYPE_OPTIONS[1]]
  })

  watch(
    () => typeOptions.value,
    () => {
      type.value = typeOptions.value?.[0].value
    },
    { immediate: true }
  )

  const ChooseTypeAndGoods = defineComponent({
    setup(props) {
      return () => {
        return (
          <div class="after-sale-step-1">
            <ScrollView class="goods-scroller scroll-view" scrollY>
              <div class="goods-list">
                {orderDetailRef.value?.subOrders.map(item => {
                  const price = Number(item.payAmountText) / item.count || item.payAmountText
                  return (
                    <div
                      class="goods"
                      onClick={() => {
                        checkOrder(item)
                      }}
                    >
                      <Radio checked={checkedOrders.value.includes(item.orderNo)}></Radio>
                      <GoodsItem
                        type="horizontal"
                        image={item.goodsStockSnapshot?.specs?.[0]?.image ?? item.goodsSnapshot?.coverImages?.[0]}
                        name={item.goodsName}
                        price={price}
                        desc={item.goodsStockSnapshot.specs.map(spec => spec.v).join('／')}
                        action={<div class="order-detail__goods-count">× {item.count}</div>}
                      />
                      {item.afterSaleOrderNo && (
                        <div
                          class="goods-af-exist"
                          onClick={withModifiers(() => {
                            navigateToAfterSaleResult(item.afterSaleOrderNo)
                          }, ['stop'])}
                        >
                          该订单已存在售后申请记录，查看售后进度
                          <Icon name="right" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </ScrollView>
            <div class="choose-type">
              <div class="title">选择售后类型</div>
              {typeOptions.value.map(item => {
                return (
                  <div
                    class={['type', item.value === type.value && 'active']}
                    onClick={() => {
                      type.value = item.value
                    }}
                  >
                    {item.label}
                  </div>
                )
              })}
            </div>
            <div class="after-sale-step-actions-placeholder"></div>
            <div class="after-sale-step-actions">
              <div
                class="action"
                onClick={() => {
                  modal.close()
                }}
              >
                取消
              </div>
              <div
                class="action primary"
                onClick={() => {
                  if (checkedOrders.value.length === 0) {
                    useToast('请选择商品')
                    return void 0
                  }
                  toggleStep2()
                }}
              >
                下一步
              </div>
            </div>
          </div>
        )
      }
    }
  })

  const checkedReasons = ref<string[]>([])
  const ChooseReason = defineComponent({
    setup() {
      const merchantStore = useMerchantStore()
      const { reasonOptions } = storeToRefs(merchantStore)

      checkedReasons.value = []

      const orders = computed(() => {
        return orderDetailRef.value?.subOrders.filter(item => checkedOrders.value.includes(item.orderNo))
      })

      const current = ref(0)

      const handleNext = () => {
        const index = checkedOrders.value.findIndex((item, index) => !checkedReasons.value[index])
        if (index !== -1) {
          current.value = index
          useToast('请选择原因')
        } else {
          modal.close()
          navigateToAfterSale({
            mainOrderNo: orderDetailRef.value!.orderNo,
            type: type.value,
            orders: checkedOrders.value.map((item, index) => {
              return {
                orderNo: item,
                reason: checkedReasons.value[index]
              }
            })
          })
        }
      }

      const onCheckReason = (text: string) => {
        checkedReasons.value[current.value] = text
        const index = checkedOrders.value.findIndex((item, index) => !checkedReasons.value[index])
        if (index !== -1) {
          setTimeout(() => {
            current.value = index
          }, 300)
        }
      }

      return () => {
        return (
          <div class="after-sale-step-2">
            {orders.value?.length! > 1 && (
              <div class="orders">
                {orders.value?.map((item, index) => {
                  const img: string = item.goodsStockSnapshot?.[0]?.image ?? item.goodsSnapshot?.coverImages?.[0]
                  return (
                    <div
                      class={['order-item', index === current.value && 'active']}
                      onClick={() => {
                        current.value = index
                      }}
                    >
                      {img && <Image class="image" mode="aspectFill" src={img} />}
                      {checkedReasons.value[index] && <Icon class="ok" name="check-fill" />}
                    </div>
                  )
                })}
              </div>
            )}
            <Swiper
              class="reason-swiper"
              current={current.value}
              onChange={e => {
                current.value = e.detail.current
              }}
            >
              {checkedOrders.value.map((item, index) => {
                const currentReason = checkedReasons.value[index]
                return (
                  <SwiperItem>
                    <ScrollView class="reasons-scroller" scrollY>
                      <div class="reasons">
                        {reasonOptions.value.map(text => {
                          return (
                            <div
                              class="reason-item"
                              onClick={() => {
                                onCheckReason(text)
                              }}
                            >
                              <Radio checked={text === currentReason}></Radio>
                              <div class="text">{text}</div>
                            </div>
                          )
                        })}
                      </div>
                    </ScrollView>
                  </SwiperItem>
                )
              })}
            </Swiper>
            <div class="after-sale-step-actions-placeholder"></div>
            <div class="after-sale-step-actions">
              <div
                class="action"
                onClick={() => {
                  toggleStep1()
                }}
              >
                上一步
              </div>
              <div class="action primary" onClick={handleNext}>
                下一步
              </div>
            </div>
          </div>
        )
      }
    }
  })
}

export default useAfterSale
