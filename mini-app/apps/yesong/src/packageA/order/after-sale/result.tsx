import { computed, defineComponent, onMounted, ref } from 'vue'
import './result.scss'
import {
  BasePage,
  useConfirm,
  useCopyText,
  useLoading,
  useLoadingEnd,
  useModal,
  usePreviewImages,
  useResponseMessage,
  useToast
} from '@anteng/core'
import { IAfterSaleOrder } from '../../../api/order/types'
import { requestCancelAfterSale, requestGetAfterSaleDetail, requestUpdateAfterSaleExpress } from '../../../api'
import Taro, { nextTick, useRouter } from '@tarojs/taro'
import OrderGoodsItem from '../../../components/order-goods-item'
import { navigateToGoodsDetail } from '../../../router'
import { Icon, Radio } from '@anteng/ui'
import ExpressInfo from '../../../components/express-info'
import { Button, Image, View } from '@tarojs/components'
import { Input } from '@tarojs/components'
import { EXPRESS_COMPANY_OPTIONS } from '@anteng/config'
import useMerchantStore from '../../../stores/merchant'
import { storeToRefs } from 'pinia'
import {
  AFTER_SALE_TYPE_OPTIONS,
  AFTER_SALE_TYPE_REFUND,
  computedAfterSaleStatus,
  ORDER_AFTER_SALES_STATUS_ACCESS,
  ORDER_AFTER_SALES_STATUS_PENDING,
  ORDER_AFTER_SALES_STATUS_PENDING_RECEIVE,
  PAYMENT_CHANNEL_OPTIONS
} from '../../../constants'

definePageConfig({
  navigationStyle: 'custom',
  navigationBarTextStyle: 'black'
})

export default defineComponent({
  name: '',
  setup() {
    const afterSaleOrderNo = useRouter().params.afterSaleOrderNo
    const detailRef = ref<IAfterSaleOrder>()

    const merchantStore = useMerchantStore()
    const { merchantOrderFlow } = storeToRefs(merchantStore)

    const fetchData = async () => {
      if (!afterSaleOrderNo) return void 0
      useLoading()
      try {
        const res = await requestGetAfterSaleDetail(afterSaleOrderNo!)
        if (res.code === 200) {
          detailRef.value = res.data
        } else {
          useResponseMessage(res)
        }
      } catch (err) {
        useResponseMessage(err)
      } finally {
        useLoadingEnd()
      }
    }

    onMounted(() => {
      fetchData()
    })

    const computedStatus = computed(() => {
      if (!detailRef.value) return null
      return computedAfterSaleStatus(detailRef.value)
    })

    const statusRef = computed(() => {
      switch (computedStatus.value) {
        case 'A':
          return {
            title: '待商家处理',
            subtitle: '已通知商家尽快处理该订单'
          }
        case 'B':
          return {
            title: '待商家处理',
            subtitle: '已通知商家尽快处理该订单'
          }
        case 'C':
          return {
            title: '退款中',
            subtitle: '商家已同意申请，正在退款中'
          }
        case 'D':
          return {
            title: '商品待寄回',
            subtitle: '商家已同意退货申请，请尽快提交退货物流信息'
          }
        case 'E':
          return {
            title: '待商家收货',
            subtitle: '请等待商家验收退货商品'
          }
        case 'F':
          return {
            title: '商家拒绝退款',
            subtitle: detailRef.value?.refundMark || detailRef.value?.returnMark
          }
        case 'G':
          return {
            title: '售后已关闭',
            subtitle: '商家关闭了售后申请'
          }
        case 'H':
          return {
            title: '售后取消',
            subtitle: '你已取消售后申请'
          }
        case 'I':
          return {
            title: '退款成功',
            subtitle: '款项已原路退回，请注意查收'
          }
        default:
          return {
            title: '待商家处理中',
            subtitle: '已通知商家尽快处理该订单'
          }
      }
    })

    const returnInfo = computed(() => {
      const { name, phone, address } = detailRef.value?.returnAddress ?? {}
      return {
        name: name || '',
        phone: phone || '',
        address: address || '',
        remark: detailRef.value?.returnMark || ''
      }
    })

    /** 复制退回信息 */
    const copyReturnInfo = () => {
      const { name, phone, address } = returnInfo.value
      useCopyText(`${name} ${phone} ${address}`)
    }

    const expressName = computed(() => {
      return detailRef.value?.courierName
    })
    const expressNo = computed(() => {
      return detailRef.value?.courierNo
    })

    const onCommitExpressInfo = () => {
      commitExpressInfo(
        {
          expressName: expressName.value,
          expressNo: expressNo.value
        },
        res => {
          useLoading()
          requestUpdateAfterSaleExpress(afterSaleOrderNo!, {
            expressName: res.expressName,
            expressNo: res.expressNo
          })
            .then(res => {
              useResponseMessage(res)
              fetchData()
            })
            .catch(useResponseMessage)
            .finally(() => {
              useLoadingEnd()
            })
        }
      )
    }

    const onDescClick = () => {
      useModal({
        title: '补充说明',
        content: (
          <div class="desc-modal">
            <div class="text">{detailRef.value!.describe || '无补充说明内容'}</div>
            <div class="images">
              {detailRef.value!.attachments?.map((item, index) => {
                return (
                  <div
                    class="image-wrap"
                    onClick={() => {
                      usePreviewImages({
                        urls: detailRef.value!.attachments,
                        current: index
                      })
                    }}
                  >
                    <Image src={item} mode="aspectFill" class="image" />
                  </div>
                )
              })}
            </div>
          </div>
        )
      })
    }

    /** 是否显示取消按钮 */
    const cancelVisible = computed(() => {
      // 售后状态 = 待商家处理、待买家退货】时，支持取消，取消后售后状态更新为【已取消】
      return [ORDER_AFTER_SALES_STATUS_PENDING, ORDER_AFTER_SALES_STATUS_ACCESS].includes(detailRef.value?.status!)
    })

    /** 取消售后申请 */
    const onCancelAfterSale = () => {
      useConfirm({
        title: '取消售后',
        content: '确定要取消售后吗？',
        onConfirm: () => {
          useLoading()
          requestCancelAfterSale(afterSaleOrderNo!)
            .then(useResponseMessage)
            .catch(useResponseMessage)
            .finally(() => {
              useLoadingEnd()
              fetchData()
            })
        }
      })
    }

    /** 物流单号可修改 */
    const expressEditable = computed(() => {
      // 卖家待收货时
      return detailRef.value?.status === ORDER_AFTER_SALES_STATUS_PENDING_RECEIVE
    })

    return () => {
      return (
        <BasePage class="after-sale-result-page" navigator={{ title: '售后进度' }}>
          {{
            default: () => {
              if (!detailRef.value) return null
              const detail = detailRef.value!
              const subOrder = detail.subOrder
              return (
                <>
                  <div class="page-header">
                    <div class="title">{statusRef.value.title}</div>
                    <div class="subtitle">{statusRef.value.subtitle}</div>
                  </div>

                  {expressNo.value && (
                    <div class="block">
                      <div class="block-title">
                        物流信息
                        {expressEditable.value && (
                          <div class="has-send modify" onClick={onCommitExpressInfo}>
                            修改物流
                            <Icon name="right" />
                          </div>
                        )}
                      </div>
                      <ExpressInfo
                        expressName={expressName.value}
                        expressNo={expressNo.value}
                        address={{
                          provinceName: null,
                          cityName: null,
                          countyName: null,
                          detailInfo: returnInfo.value.address,
                          userName: returnInfo.value.name,
                          telNumber: returnInfo.value.phone
                        }}
                      />
                      {returnInfo.value.remark && (
                        <div class="return-remark">
                          <Icon name="info" />
                          商家备注：{returnInfo.value.remark}
                        </div>
                      )}
                    </div>
                  )}

                  {detailRef.value.type === AFTER_SALE_TYPE_REFUND &&
                    !expressNo.value &&
                    detailRef.value.status === ORDER_AFTER_SALES_STATUS_ACCESS && (
                      <div class="block">
                        <div class="block-title">
                          商家售后地址
                          <div class="has-send" onClick={onCommitExpressInfo}>
                            我已寄出
                            <Icon name="right" />
                          </div>
                        </div>
                        <View class="return-address" onClick={copyReturnInfo} onLongpress={copyReturnInfo}>
                          <div class="contact">
                            {returnInfo.value.name}
                            <div class="phone number-font">{returnInfo.value.phone}</div>
                          </div>
                          <div class="address">{returnInfo.value.address}</div>
                        </View>
                        {returnInfo.value.remark && (
                          <div class="return-remark">
                            <Icon name="info" />
                            商家备注：{returnInfo.value.remark}
                          </div>
                        )}
                      </div>
                    )}
                  <div class="block">
                    <div class="block-title">售后商品</div>
                    <OrderGoodsItem
                      image={subOrder.goodsStockSnapshot?.specs?.[0]?.image || subOrder?.coverImages?.[0]}
                      name={subOrder.goodsName}
                      spec={subOrder.goodsStockSnapshot.specs.map(spec => spec.v).join('／')}
                      unitPrice={subOrder.priceText}
                      unitPricePaid={subOrder.$payUnitAmountText}
                      count={subOrder.count}
                      onClick={() => {
                        navigateToGoodsDetail(subOrder.goodsId)
                      }}
                    ></OrderGoodsItem>
                  </div>
                  <div class="block">
                    <div class="block-title">申请详情</div>
                    <div class="detail-info">
                      <div class="info-item">
                        <div class="label">退款金额</div>
                        <div class="value number-font">&yen;{detail.amount! / 100}</div>
                        <div class="small">
                          {detailRef.value.applyRefundChannelInfos
                            ?.map((item, index, arr) => {
                              if (item.refundAmount > 0) {
                                return `${
                                  PAYMENT_CHANNEL_OPTIONS.find(i => i.value === item.paymentChannel)?.label2 || ''
                                }退回
 ${(item.refundAmount / 100).toFixed(2)} 元`
                              }
                            })
                            .join('，')}
                        </div>
                      </div>
                      <div class="info-item">
                        <div class="label">申请数量</div>
                        <div class="value">&times; {detail.subOrder.count}</div>
                      </div>
                      <div class="info-item">
                        <div class="label">申请时间</div>
                        <div class="value">{detail.createTime ?? '-'}</div>
                      </div>
                      <div
                        class="info-item"
                        onClick={() => {
                          useCopyText(detail.afterSaleOrderNo)
                        }}
                      >
                        <div class="label">售后单号</div>
                        <div class="value">
                          {detail.afterSaleOrderNo}
                          <div class="copy-btn">复制</div>
                        </div>
                      </div>
                      <div class="info-item">
                        <div class="label">售后类型</div>
                        <div class="value">
                          {AFTER_SALE_TYPE_OPTIONS.find(item => item.value === detail.type)?.label}
                        </div>
                      </div>
                      <div class="info-item">
                        <div class="label">售后原因</div>
                        <div class="value">{detail.reason}</div>
                      </div>
                      <div class="info-item" onClick={onDescClick}>
                        <div class="label">补充说明</div>
                        {detail.describe ? (
                          <div class="value">
                            <div class="max-2-line">{detail.describe}</div>
                          </div>
                        ) : (
                          <div class="value null">无内容</div>
                        )}
                      </div>
                      <div class="info-item images" onClick={onDescClick}>
                        <div class="label">凭证图片</div>
                        {detail.attachments?.length > 0 ? (
                          <div class="value">
                            <div class={['desc-images', detail.attachments?.length > 3 && 'desc-images-4']}>
                              {detail.attachments?.slice(0, 4).map((item, index) => {
                                return (
                                  <div class="desc-image">
                                    <Image class="image" src={item} mode="aspectFill" />
                                    {index === 3 && detail.attachments.length > 4 && (
                                      <div class="count">＋{detail.attachments.length - 3}</div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ) : (
                          <div class="value null">未上传图片</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div class="after-sale-result__action-bar">
                    <div class="content">
                      {cancelVisible.value && (
                        <div class="action" onClick={onCancelAfterSale}>
                          取消申请
                        </div>
                      )}
                      <div class="action">
                        联系客服
                        <Button class="btn" openType="contact"></Button>
                      </div>
                    </div>
                  </div>
                  <div class="after-sale-result__action-bar--block"></div>
                </>
              )
            }
          }}
        </BasePage>
      )
    }
  }
})

/** 提交退回物流信息 */
const commitExpressInfo = (
  options?: { expressName?: string; expressNo?: string },
  callBack?: (res: { expressName: string; expressNo: string }) => void
) => {
  const expressName = ref(options?.expressName ?? '')
  const expressNo = ref(options?.expressNo ?? '')
  const focus = ref(false)
  setTimeout(() => {
    focus.value = true
  }, 600)

  const onScanCode = () => {
    if (Taro.canIUse('scanCode')) {
      Taro.scanCode({
        success: res => {
          expressNo.value = res.result
        }
      })
    } else {
      useToast('当前设备不支持，请手动输入')
    }
  }

  const confirm = () => {
    if (!expressName.value) {
      useToast('请选择物流公司')
      return void 0
    } else if (!expressNo.value) {
      useToast('请输入物流单号')
      return void 0
    }
    callBack?.({
      expressName: expressName.value,
      expressNo: expressNo.value
    })
    modal.close()
  }

  const modal = useModal({
    title: '填写退回物流信息',
    height: 600,
    content: () => {
      return (
        <div class="after-sale-commit-express">
          <div class="tip">请根据商家提供售后地址自行寄出，并填写物流信息。</div>
          <div class="input-wrap">
            <div class="label">物流单号</div>
            <Input
              class="input"
              autoFocus={focus.value}
              focus={focus.value}
              value={expressNo.value}
              alwaysEmbed
              onInput={e => {
                expressNo.value = e.detail.value
              }}
              onBlur={() => {
                focus.value = false
              }}
              onConfirm={confirm}
            />
            <div class="scan" onClick={onScanCode}>
              <Icon name="scan-code" />
            </div>
          </div>
          <div
            class="input-wrap"
            onClick={() => {
              focus.value = false
              selectExpressCompany(expressName.value, name => {
                expressName.value = name
              })
            }}
          >
            <div class="label">物流公司</div>
            <div class="input">{expressName.value}</div>
            <Icon name="right" />
          </div>
          <div class="action" onClick={confirm}>
            确定
          </div>
        </div>
      )
    }
  })
}

const selectExpressCompany = (name?: string, callback?: (name: string) => void) => {
  const nameRef = ref(name || '')
  const onCheck = (name: string) => {
    nameRef.value = name
    nextTick(() => {
      callback?.(nameRef.value)
      modal.close()
    })
  }
  const modal = useModal({
    title: '选择物流公司',
    height: 600,
    maskVisible: false,
    content: () => (
      <div class="after-sale-select-express">
        <div class="list">
          {EXPRESS_COMPANY_OPTIONS.map(item => {
            return (
              <div
                class="item"
                onClick={() => {
                  onCheck(item.value)
                }}
              >
                <Radio checked={item.value === nameRef.value}></Radio>
                <div class="text">{item.value}</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  })
}
