import {
  BasePage,
  ImageUploader,
  navigateBack,
  safeParse,
  useLoading,
  useLoadingEnd,
  useModal,
  usePreviewImages,
  useResponseMessage,
  useToast
} from '@pkg/core'
import { useRouter } from '@tarojs/taro'
import { computed, defineComponent, onMounted, reactive, ref, toRaw, watch, withModifiers } from 'vue'
import { $getRefundAmountCalculator, getGoodsOrderDetail, requestSubmitAfterSale } from '../../../api'
import { IOrderDetail } from '../../../api/order/types'
import './style.scss'
import GoodsItem from '../../../components/goods-item'
import CountStepper from '../../../components/count-stepper'
import { Icon, Radio } from '@pkg/ui'
import useMerchantStore from '../../../stores/merchant'
import { storeToRefs } from 'pinia'
import { Image, Input, ScrollView, Textarea } from '@tarojs/components'
import { PAYMENT_CHANNEL_OPTIONS } from '../../../constants'
import axios, { CancelTokenSource } from 'axios'

definePageConfig({
  navigationStyle: 'custom',
  navigationBarTextStyle: 'black'
})

export default defineComponent({
  name: '',
  setup() {
    const route = useRouter()
    const paramsMainOrderNo = route.params.mainOrderNo!
    const paramsType = route.params.type
    const paramsOrders = (safeParse(decodeURIComponent(decodeURIComponent(route.params.orders || ''))) || []) as {
      orderNo: string
      reason: string
    }[]

    const detailRef = ref<IOrderDetail>()
    const getOrder = () => {
      useLoading({ toastVisible: false, text: '' })
      getGoodsOrderDetail(paramsMainOrderNo!)
        .then(res => {
          if (res.code === 200) {
            detailRef.value = res.data
          } else {
            useResponseMessage(res)
          }
        })
        .catch(err => {
          useResponseMessage(err)
        })
        .finally(() => {
          useLoadingEnd()
        })
    }

    const initialStates = paramsOrders.map(item => {
      return {
        mainOrderNo: paramsMainOrderNo,
        type: Number(paramsType),
        orderNo: item.orderNo,
        reason: item.reason || '',
        count: null as unknown as number,
        amount: null as unknown as number,
        desc: '',
        images: [] as string[],
        $refundAmountCalculator: null as unknown as any[],
        $calcAmount: null as unknown as number
      }
    })
    const states = reactive(initialStates)
    const totalCount = computed(() => {
      return states.reduce((v, item) => {
        return v + item.count
      }, 0)
    })
    const totalAmount = computed(() => {
      return states
        .reduce((v, item) => {
          return v + Number(item.amount)
        }, 0)
        .toFixed(2)
    })

    let cancelCalcAmount: CancelTokenSource
    const calcAmount = (index: number) => {
      const state = states[index]
      cancelCalcAmount?.cancel?.()
      cancelCalcAmount = axios.CancelToken.source()
      $getRefundAmountCalculator(state.mainOrderNo, { amount: state.amount * 100 }, cancelCalcAmount)
        .then(res => {
          state.$refundAmountCalculator = res.data || []
          state.$calcAmount = state.amount
        })
        .catch(err => {
          console.log(err)
        })
    }

    watch(
      () => states,
      (newValue, oldValue) => {
        newValue.forEach((item, index) => {
          if (item.amount && oldValue?.[index].$calcAmount !== item.amount) {
            calcAmount(index)
          }
        })
      },
      { immediate: true, deep: true }
    )

    onMounted(() => {
      getOrder()
    })

    const orders = computed<IOrderDetail['subOrders']>(() => {
      return paramsOrders.map(item => {
        return detailRef.value?.subOrders.find(o => o.orderNo === item.orderNo)!
      })
    })

    watch(
      () => orders.value,
      () => {
        orders.value?.map((item, index) => {
          onCountChange(index, item.count)
        })
      }
    )

    const onCountChange = (index: number, count: number) => {
      states[index].count = count
      states[index].amount = Number(orders.value[index].$payUnitAmountText) * count
    }

    const onConfirm = () => {
      useLoading()
      Promise.allSettled(
        states.map(item => {
          return requestSubmitAfterSale({
            mainOrderNo: item.mainOrderNo,
            subOrderNo: item.orderNo,
            amount: item.amount * 100,
            count: item.count!,
            reason: item.reason,
            desc: item.desc,
            images: item.images,
            type: item.type
          })
        })
      )
        .then(() => {
          navigateBack()
          setTimeout(() => {
            useToast('售后申请提交成功')
          }, 320)
        })
        .catch(err => {
          useResponseMessage(err)
        })
        .finally(() => {
          useLoadingEnd()
        })
    }

    return () => {
      return (
        <BasePage navigator={{ title: '确认售后信息' }}>
          <div class="after-sale-confirm-page">
            {orders.value.map((item, index) => {
              const state = states[index]
              if (!item) {
                return null
              }
              const noDesc = !(state.desc?.length > 0 || state.images?.length > 0)

              const price = Number(item.payAmountText) / item.count || item.payAmountText

              return (
                <div class="order-item">
                  <GoodsItem
                    type="horizontal"
                    image={item.goodsStockSnapshot?.specs?.[0]?.image ?? item.goodsSnapshot?.coverImages?.[0]}
                    name={item.goodsName}
                    price={price}
                    desc={item.goodsStockSnapshot.specs.map(spec => spec.v).join('／')}
                    action={<div class="order-detail__goods-count">× {item.count}</div>}
                  />
                  <div class="split"></div>
                  <div
                    class="info-item"
                    onClick={() => {
                      chooseReason(paramsOrders[index].reason, text => {
                        state.reason = text
                      })
                    }}
                  >
                    <div class="label">售后原因</div>
                    <div class="value">{state.reason}</div>
                    <Icon name="right" />
                  </div>
                  <div class="info-item">
                    <div class="label">申请数量</div>
                    <div class="value">
                      <CountStepper
                        class="stepper"
                        size="small"
                        value={state.count}
                        min={1}
                        max={item.count}
                        onChange={c => {
                          onCountChange(index, c)
                        }}
                        maxMessage="不能超出订单数量"
                        minMessage="最少申请 1 件"
                      />
                      <div class="small">最多可申请 {item.count} 件</div>
                    </div>
                    <Icon name="right" style="opacity:0" />
                  </div>
                  <div
                    class="info-item"
                    onClick={() => {
                      editRefundAmount(state.amount, Number(item.$payUnitAmountText) * state.count, a => {
                        state.amount = a
                        calcAmount(index)
                      })
                    }}
                  >
                    <div class="label">退款金额</div>
                    <div class="value">
                      <div class="amount">
                        <div class="yen">&yen;</div>
                        {state.amount.toFixed(2)}
                      </div>
                      <div class="refund-calculator">
                        {state.$refundAmountCalculator?.map((item, index, arr) => {
                          if (item.refundAmount > 0) {
                            return (
                              <div>
                                {PAYMENT_CHANNEL_OPTIONS.find(i => i.value === item.paymentChannel)?.label2}退回 &nbsp;
                                {(item.refundAmount / 100).toFixed(2)}&nbsp;元
                              </div>
                            )
                          }
                        })}
                      </div>
                      {/* <div class="small">
                        最多可退款 &yen;{(Number(item.$payUnitAmountText) * state.count).toFixed(2)}
                      </div> */}
                    </div>
                    <Icon name="right" />
                  </div>
                  <div
                    class="info-item"
                    onClick={() => {
                      editDescription(
                        {
                          desc: state.desc,
                          images: state.images
                        },
                        d => {
                          state.desc = d.desc
                          state.images = d.images
                        }
                      )
                    }}
                  >
                    <div class="label">
                      上传描述和凭证
                      {noDesc && <div class="small primary">补充描述，有助于商家处理售后问题</div>}
                    </div>
                    {noDesc ? <div class="value placeholder">未填写</div> : <div class="value placeholder">修改</div>}
                    <Icon name="right" />
                    {!noDesc && (
                      <div class="order-item-desc">
                        <div class="subtitle">描述内容</div>
                        {state.desc ? (
                          <div class="text">{state.desc}</div>
                        ) : (
                          <div class="text placeholder">未填写文字描述</div>
                        )}

                        <div class="subtitle">凭证图片</div>

                        {state.images.length > 0 ? (
                          <ScrollView class="desc-images-scroller" scrollX>
                            <div class="desc-images">
                              {state.images.map((item, index) => {
                                return (
                                  <div
                                    class="image-wrap"
                                    onClick={withModifiers(() => {
                                      usePreviewImages({
                                        urls: state.images,
                                        current: index
                                      })
                                    }, ['stop'])}
                                  >
                                    <Image class="image" src={item} mode="aspectFill" />
                                  </div>
                                )
                              })}
                            </div>
                          </ScrollView>
                        ) : (
                          <div class="text placeholder">未上传</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            <div class="footer">
              <div class="tip">
                共 {totalCount.value} 件，预计将退款
                <div class="amount">
                  <div class="yen">&yen;</div>
                  {totalAmount.value}
                </div>
              </div>
              <div class="action" onClick={onConfirm}>
                提交申请
              </div>
            </div>
          </div>
        </BasePage>
      )
    }
  }
})

const chooseReason = (text: string, callback: (text: string) => void) => {
  const merchantStore = useMerchantStore()
  const { reasonOptions } = storeToRefs(merchantStore)
  const checkedReason = ref(text || '')
  const modal = useModal({
    title: '选择售后原因',
    height: 'auto',
    content: () => {
      return (
        <div class="after-sale-reasons">
          {reasonOptions.value.map(text => {
            return (
              <div
                class="item"
                onClick={() => {
                  checkedReason.value = text
                  setTimeout(() => {
                    modal.close()
                    callback(text)
                  }, 100)
                }}
              >
                <Radio checked={text === checkedReason.value} />
                <div class="text">{text}</div>
              </div>
            )
          })}
        </div>
      )
    }
  })
}

const editRefundAmount = (amount: number, max: number, callback: (amount: number) => void) => {
  const amountRef = ref(String(amount))
  const focus = ref(false)
  setTimeout(() => {
    focus.value = true
  }, 600)

  const format = () => {
    let value = Number(amountRef.value)
    if (!amountRef.value || Number.isNaN(value)) {
      amountRef.value = max.toFixed(2)
      return void 0
    }
    value = value > max ? max : value > 0 ? value : 0
    amountRef.value = value.toFixed(2)
  }

  const confirm = () => {
    format()
    const value = Number(amountRef.value)
    callback(value)
    modal.close()
  }

  const modal = useModal({
    title: '修改退款金额',
    content: () => {
      return (
        <div class="after-sale-edit-amount">
          <div class="tip">
            请输入意向退款金额，最多可退{' '}
            <div class="amount">
              <div class="yen">&yen;</div>
              {max.toFixed(2)}
            </div>
          </div>
          <div class="input-wrap">
            <div class="label">退款金额</div>
            <Input
              class="input"
              type="digit"
              autoFocus={focus.value}
              focus={focus.value}
              value={amountRef.value}
              alwaysEmbed
              onInput={e => {
                amountRef.value = e.detail.value
              }}
              onBlur={() => {
                focus.value = false
                format()
              }}
              onConfirm={confirm}
            />
          </div>
          <div class="action" onClick={confirm}>
            确定
          </div>
        </div>
      )
    }
  })
}

const editDescription = (
  options: { desc?: string; images?: string[] },
  callback: (data: { desc: string; images: string[] }) => void
) => {
  const state = reactive({
    desc: options.desc ?? '',
    images: options.images ?? ([] as string[])
  })

  const confirm = () => {
    callback(toRaw(state))
    modal.close()
  }

  const modal = useModal({
    title: '补充描述',
    height: 'max',
    content: () => {
      return (
        <div class="after-sale-edit-desc">
          <div class="form">
            <div class="textarea-wrap">
              <div class="subtitle">描述内容</div>
              <Textarea
                class="textarea"
                placeholderClass="placeholder"
                cursorSpacing={320}
                placeholder="补充描述，有助于商家处理售后问题"
                maxlength={200}
                adjustKeyboardTo={false}
                adjustPosition={false}
                value={state.desc}
                onInput={e => {
                  state.desc = e.detail.value
                }}
              />
              <div class="count">{state.desc.length}／200</div>
            </div>
            <div class="images-list">
              <div class="subtitle">
                凭证图片<div class="small">（最多9张）</div>
              </div>
              <ImageUploader
                maxCount={9}
                images={state.images}
                onChange={list => {
                  state.images = list
                }}
              />
            </div>
          </div>
          <div class="action" onClick={confirm}>
            确定
          </div>
        </div>
      )
    }
  })
}
