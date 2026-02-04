import {
  BasePage,
  buildUrl,
  useLoading,
  useLoadingEnd,
  useModal,
  usePay,
  useResponseMessage,
  useToast,
  withLogin,
  withWechatBind
} from '@pkg/core'
import GoodsItem from '../../../components/goods-item'
import { computed, defineComponent, onMounted, onUnmounted, ref, watch, withModifiers } from 'vue'
import './style.scss'
import CountStepper from '../../../components/count-stepper'
import { Icon, Radio, Switch } from '@pkg/ui'
import AddressSelector from './address-selector'
import Taro, { nextTick, useRouter } from '@tarojs/taro'
import { formatPrice, uuid } from '@pkg/utils'
import { useOrderPayStore } from './store'
import Skeleton from './skeleton'
import { commitCartGoodsOrder, commitGoodsOrder, ICartGoodsOrderParams, IGoodsOrderParams } from '../../../api/order'
import { GOODS_TYPE_ENTITY, GOODS_TYPE_STORE_VERIFICATION, ORDER_ORIGIN_CART } from '../../../constants'
import { navigateToPayResult } from '../../../router'
import { useCartStore } from '../../../stores'
import { useProfileStore } from '../../../stores/profile'
import { clamp } from 'lodash-es'
import { addressTranslationToCode, findItemByCode } from '../../../utils'
import useAddress from '../../../hooks/useAddress'
import { storeToRefs } from 'pinia'
import {
  PAYMENT_METHOD_BALANCE,
  PAYMENT_METHOD_NONE,
  PAYMENT_METHOD_VALUE_CARD,
  SUB_PAYMENT_METHOD_WECHAT_PAY
} from '@pkg/config'
import useMerchantStore from '../../../stores/merchant'

definePageConfig({
  navigationStyle: 'custom'
})

const parseParams = (params: any) => {
  try {
    return JSON.parse(decodeURIComponent(params))
  } catch (err) {
    console.log(err)
    return {}
  }
}

const GoodSkeleton = () => {
  return <GoodsItem type="horizontal" action={<CountStepper size="small" value={1} />} />
}

export type OrderPayGoodsParams = {
  /** 商品 id */
  gid: string
  /** sku id */
  sid: string
  /** 购物车子项 id */
  cid?: string
  /** 数量 */
  count: number
}

export default defineComponent({
  name: 'OrderPay',
  setup() {
    /** 订单来源：购物车 */
    const isFromCart = useRouter().params.origin === ORDER_ORIGIN_CART.toString()

    const paramsError = !useRouter().params.params

    let urlParams: OrderPayGoodsParams[] = parseParams(useRouter().params.params)
    urlParams = Array.isArray(urlParams) ? urlParams : [urlParams]
    //  收货区域不合法时的提示
    const notAvailableForPurchaseList = ref<any[]>([])
    const pageId = uuid()
    const orderPayStore = useOrderPayStore(pageId)

    const { SelectCouponButton } = orderPayStore

    orderPayStore.initList(
      urlParams.map(item => {
        return {
          goodsId: item.gid,
          skuId: item.sid,
          count: item.count ?? 1
        }
      })
    )

    const {
      isLoading,
      useBalance,
      totalAmount,
      paymentAmount,
      discountAmount,
      goodsDetailMap,
      goodsDetailFailedMap,
      goodsList,
      goodsCount,
      subPayMethod,
      availableSubPayMethod,
      availablePayMethod,
      currentCoupon
    } = storeToRefs(orderPayStore)

    const useAddressEntities = useAddress()
    const { address } = storeToRefs(useAddressEntities)

    onMounted(() => {
      // 获取订单流程
      useMerchantStore().getMerchantOrderFlow()
    })

    onUnmounted(() => {
      // 页面卸载后删除 store 释放内存
      orderPayStore.$dispose()
    })

    const needAddress = computed(() => {
      return (
        goodsList.value.filter(item => {
          return goodsDetailMap.value[item.goodsId]?.type === GOODS_TYPE_ENTITY
        }).length > 0
      )
    })
    const addressSelectorRef = ref()
    const onChooseAddress = () => {
      useAddressEntities.chooseAddress()
    }

    const onConfirm =
      // 需登录
      withLogin(
        // 需绑定微信
        withWechatBind(() => {
          if (isFromCart) {
            return commitOrderFromCart()
          }

          // TODO 提取公共参数。

          const targetParams = {
            contactAddress: address.value.detailInfo!,
            contactCity: address.value.cityName!,
            contactDistrict: address.value.countyName!,
            contactMobile: address.value.telNumber!,
            contactName: address.value.userName!,
            contactProvince: address.value.provinceName!,
            count: goodsList.value[0].count,
            goodsId: goodsList.value[0].goodsId,
            goodsStockId: goodsList.value[0].skuId,
            // TODO 这里不应该耦合吧
            payMethod: useBalance.value ? PAYMENT_METHOD_BALANCE : PAYMENT_METHOD_NONE,
            subPayMethod: subPayMethod.value,
            contactProvinceCode: addressTranslationToCode(address.value.provinceName)?.code,
            contactCityCode: addressTranslationToCode(address.value.cityName)?.code,
            contactDistrictCode: addressTranslationToCode(address.value.countyName)?.code,
            discountCoupon: currentCoupon.value ? [currentCoupon.value.recordNo] : []
          }

          // 如果从购物车下单并且分享的商品id和购买的商品id一致,则需要合并 utm 参数
          const params: IGoodsOrderParams = targetParams
          /*const params: IGoodsOrderParams =
            utmFromCode.value?.goodsId === goodsList.value[0].goodsId
              ? {
                  ...targetParams,
                  ...utmFromCode.value,
                  utmContent: JSON.stringify(utmFromCode.value)
                }
              : targetParams*/

          useLoading()
          commitGoodsOrder(params)
            .then(res => {
              if (res.code === 200) {
                pay(res.data.orderNo, res.data.unifiedOrderNo)
              } else {
                useToast(res.msg)
              }
            })
            .catch(err => {
              useToast(err.response.data.msg)
            })
            .finally(() => {
              useLoadingEnd()
              // 刷新余额账户
              profileStore.getAccountBalance()
            })
        })
      )

    const commitOrderFromCart = () => {
      const params: ICartGoodsOrderParams = {
        contactAddress: address.value.detailInfo!,
        contactCity: address.value.cityName!,
        contactDistrict: address.value.countyName!,
        contactMobile: address.value.telNumber!,
        contactName: address.value.userName!,
        contactProvince: address.value.provinceName!,
        itemIds: urlParams.map(item => item.cid!),
        // TODO 这里不应该耦合吧
        payMethod: useBalance.value ? PAYMENT_METHOD_BALANCE : PAYMENT_METHOD_NONE,
        subPayMethod: subPayMethod.value,
        // 用户的收货地址代码,省市区
        contactProvinceCode: addressTranslationToCode(address.value.provinceName).code,
        contactCityCode: addressTranslationToCode(address.value.cityName).code,
        contactDistrictCode: addressTranslationToCode(address.value.countyName).code,
        discountCoupon: currentCoupon.value ? [currentCoupon.value.recordNo] : []
      }

      Taro.showLoading()
      commitCartGoodsOrder(params)
        .then(res => {
          if (res.code === 200) {
            pay(res.data.orderNo, res.data.unifiedOrderNo)
          } else {
            useToast(res.msg)
          }
        })
        .catch(err => {
          useToast(err.response.data.msg)
        })
        .finally(() => {
          Taro.hideLoading()
          // 刷新购物车数据
          useCartStore().refresh()
          // 刷新余额账户
          profileStore.getAccountBalance()
        })
    }

    const pay = (orderNo: string, unifyOrderNo: string) => {
      nextTick(() => {
        useLoading()
        usePay(unifyOrderNo, {
          success: () => {
            useLoadingEnd()
          },
          fail: () => {
            useLoadingEnd()
          },
          complete: () => {
            useLoadingEnd()
            navigateToPayResult({
              orderNo: orderNo,
              unifyOrderNo: unifyOrderNo,
              redirect: true
            })
          },
          // h5（未支持支付） -> 打开小程序支付结果页 -> 完成支付
          payResultPath: buildUrl('/packageA/pay/result', {
            orderNo: orderNo,
            unifyOrderNo: unifyOrderNo
          })
        })
      })
    }

    const profileStore = useProfileStore()

    const { balance, balanceYuan, balanceText, balanceAccount, isBalanceAvailable } = storeToRefs(profileStore)

    watch(
      () => isBalanceAvailable.value,
      v => {
        if (!availablePayMethod.value.includes(PAYMENT_METHOD_BALANCE)) {
          return void 0
        }

        useBalance.value = v
      },
      { immediate: true }
    )

    profileStore.getAccountBalance()

    const balanceAmount = computed(() => {
      if (!useBalance.value) return 0
      return paymentAmount.value > balanceYuan.value ? balanceYuan.value : paymentAmount.value
    })

    const needPayAmount = computed(() => {
      return clamp(paymentAmount.value - balanceYuan.value, 0, Infinity)
    })
    const userAddressCode = ref(0)
    // 地址改变会影响购物车里的商品收货地址是否正确
    watch(
      () => address.value,
      newV => {
        if (!newV) {
          return void 0
        }
        // 用户地址改变了,清空一下之前的限售商品列表
        notAvailableForPurchaseList.value = []
        userAddressCode.value =
          addressTranslationToCode(newV?.countyName)?.code ||
          addressTranslationToCode(newV?.cityName)?.code ||
          addressTranslationToCode(newV?.provinceName)?.code
      },
      {
        immediate: true,
        deep: true
      }
    )

    /**
     * 提交验证函数
     */
    const submitValidation = () => {
      const keys = Object.keys(goodsDetailMap.value)
      // 获取其中商品类型不为限售的商品
      const listCoupons = keys.map(it => goodsDetailMap.value[it].type !== GOODS_TYPE_STORE_VERIFICATION).filter(i => i)

      if (listCoupons.length > 0) {
        if (notAvailableForPurchaseList.value.length !== 0) {
          Taro.showToast({
            title: '部分商品无法购买',
            icon: 'none'
          })
        } else {
          // 地址是否不为空
          if (address.value.isEmpty) {
            Taro.showToast({
              title: '请选择收货地址',
              icon: 'none'
            })
          } else {
            onConfirm()
          }
        }
      } else {
        // 只有卡券商品时,不需要校验是否存在地址
        onConfirm()
      }
    }

    return () => {
      if (isLoading.value)
        return (
          <BasePage navigator={{ showMenuButton: false }}>
            <Skeleton />
          </BasePage>
        )

      return (
        <BasePage
          navigator={{ title: '订单确认' }}
          tabsPlaceholder
          onClick={() => {
            if (notAvailableForPurchaseList.value?.length > 0) {
              console.log('限售商品id:')
              console.log(notAvailableForPurchaseList.value)
            }
          }}
        >
          <div class="order-pay-page">
            {needAddress.value && (
              <AddressSelector
                ref={addressSelectorRef}
                address={address.value}
                onClick={() => {
                  onChooseAddress()
                }}
              />
            )}
            <div class="order-pay-goods">
              {goodsList.value.map(item => {
                const detail = goodsDetailMap.value[item.goodsId]
                if (!detail && goodsDetailFailedMap.value[item.goodsId]) {
                  return (
                    <div class="order-pay-goods__item order-pay-goods__item--expire">
                      <div class="order-pay-goods__expire">商品不存在／已过期</div>
                      <GoodsItem type="horizontal" action={<CountStepper size="small" value={1} />} />
                      {/*<GoodSkeleton  />*/}
                    </div>
                  )
                }
                if (!detail) {
                  return <GoodSkeleton />
                }
                const targetSku = detail?.goodsSkus.find(sku => sku.id === item.skuId)

                const allAddress: string[] = []
                // 获取限售区域下所有子级地址的code
                detail?.restrictedArea?.forEach(areaGroup => {
                  areaGroup?.forEach(areaCode => {
                    const areaItem = findItemByCode(areaCode)
                    if (areaItem) {
                      // 添加当前区域的code
                      allAddress.push(areaItem.code)
                      // 递归获取所有子级的code
                      const getChildrenCode = data => {
                        if (!data) return []
                        const codeList: any[] = []
                        for (const item of data) {
                          codeList.push(item.code)
                          if (item.children) {
                            codeList.push(...getChildrenCode(item.children))
                          }
                        }
                        return codeList
                      }
                      // 添加所有子级的code
                      allAddress.push(...getChildrenCode(areaItem.children))
                    }
                  })
                })
                const { restrictedStatus, restrictedType } = detail
                return (
                  <div class={['order-pay-goods__item', !targetSku && 'order-pay-goods__item--expire']}>
                    {!targetSku && <div class="order-pay-goods__expire">商品规格已失效，请重新选择</div>}
                    <GoodsItem
                      type="horizontal"
                      image={targetSku?.specs[0].image ?? detail.coverImages[0]}
                      name={detail.title}
                      restrictedStatus={restrictedStatus}
                      restrictedArea={allAddress}
                      restrictedType={restrictedType}
                      goodsType={detail.type}
                      price={targetSku?.price}
                      userAddress={userAddressCode.value}
                      goodsId={item.goodsId}
                      onAllowBuy={e => {
                        // 添加并去重
                        notAvailableForPurchaseList.value.push(e)
                        notAvailableForPurchaseList.value = [...new Set(notAvailableForPurchaseList.value)]
                      }}
                      desc={
                        targetSku && (
                          <div>
                            {targetSku?.specs
                              .map(item => {
                                return item.v
                              })
                              .join('／')}
                          </div>
                        )
                      }
                      action={
                        isFromCart ? (
                          <div class="order-pay-goods__count">&times; {item.count}</div>
                        ) : (
                          <CountStepper
                            size="small"
                            min={detail.limitNumMin > 1 ? detail.limitNumMin : 1}
                            max={detail.limitNumMax}
                            minMessage={`不能少于 ${detail.limitNumMin > 1 ? detail.limitNumMin : 1} 件`}
                            value={item.count}
                            onChange={v => {
                              item.count = v
                            }}
                          />
                        )
                      }
                    />
                  </div>
                )
              })}
            </div>
            <div class="order-pay__block">
              <div class="order-pay__block-title">价格明细</div>
              <div class="order-pay__block-item">
                <div class="item-label">商品总价</div>
                <div class="item-content">
                  <div style="opacity:0.5;margin-right:auto;font-size:0.9em;">共 {goodsCount.value} 件商品</div>
                  <div class="number-font">&yen;{totalAmount.value.toFixed(2)}</div>
                </div>
              </div>
              {needAddress.value && (
                <div class="order-pay__block-item">
                  <div class="item-label">物流配送</div>
                  <div class="item-content" onClick={onChooseAddress}>
                    {address.value.cityName ? (
                      <div class="item-conten__address">
                        <div>免费包邮</div>
                        <div class="color-disabled">
                          {`送至 ${address.value?.provinceName} ${address.value?.cityName}`}{' '}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div class="color-disabled">选择收货地址后查看</div>
                        <Icon name="right" />
                      </>
                    )}
                  </div>
                </div>
              )}
              <div class="order-pay__block-item">
                <div class="item-label">商品优惠</div>
                <div class="item-content">
                  {/* <div class="number-font color-primary">-&yen;20</div>
                  <div class="color-disabled">&nbsp;无可用</div> */}
                  <SelectCouponButton />
                  <Icon name="right" />
                </div>
              </div>
              {/* <div
                class="order-pay__block-item"
                onClick={() => {
                  useModal({ title: '选择红包', height: 400, content: <EmptyStatus description="无可用红包" /> })
                }}
              >
                <div class="item-label">红包</div>
                <div class="item-content">
                  <div class="number-font color-primary">-&yen;20</div>
                  <div class="color-disabled">&nbsp;无可用</div>
                  <Icon name="right" />
                </div>
              </div> */}
              <div class="order-pay__block-item total">
                <div class="item-label">总计</div>
                <div class="item-content">
                  <div class="number-font">
                    <div class="yen">&yen;</div>
                    {paymentAmount.value.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
            {/* <Remark /> */}
            <div class="order-pay__block">
              <div class="order-pay__block-title">付款方式</div>

              {availableSubPayMethod.value.map(item => {
                if (paramsError && item.value !== SUB_PAYMENT_METHOD_WECHAT_PAY) {
                  return null
                }

                return (
                  <div
                    class="order-pay__type-item"
                    onClick={() => {
                      subPayMethod.value = item.value
                    }}
                  >
                    <div
                      class="logo"
                      style={{
                        backgroundImage: `url(${item.icon})`
                      }}
                    ></div>
                    <div class="name">{item.label}</div>
                    <div class="action">
                      <Radio checked={item.value === subPayMethod.value} />
                    </div>
                  </div>
                )
              })}

              {availablePayMethod.value.length > 0 && <div class="order-pay__type-split"></div>}

              {availablePayMethod.value.map(item => {
                if (item === PAYMENT_METHOD_VALUE_CARD) {
                  return (
                    <div class="order-pay__type-item">
                      <div class="logo">
                        <Icon name="value-card" style="color: #5386ff" />
                      </div>
                      <div class="name">储值卡</div>
                      <div class="action color-disabled" style="font-size:0.85em">
                        无可用储值卡
                      </div>
                    </div>
                  )
                }

                if (item === PAYMENT_METHOD_BALANCE) {
                  return (
                    <div class="order-pay__type-item">
                      <div class="logo">
                        <Icon name="balance-pay" />
                      </div>
                      <div
                        class="name"
                        onClick={() => {
                          useModal({
                            title: '余额说明',
                            height: 300,
                            content: ''
                          })
                        }}
                      >
                        <div class="name-text">
                          使用余额
                          <Icon name="help" />
                        </div>
                        {balanceAccount.value ? (
                          <div class="desc">当前可用余额 {profileStore.balanceText} 元</div>
                        ) : (
                          <div
                            class="desc"
                            onClick={withModifiers(() => {
                              profileStore.getAccountBalance().catch(useResponseMessage)
                            }, ['stop'])}
                          >
                            未获取到账户余额，
                            <div class="color-primary">
                              刷新重试&nbsp;
                              <Icon name="refresh" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div class="action">
                        <Switch
                          checked={useBalance.value}
                          disabled={!isBalanceAvailable.value}
                          onChange={v => {
                            useBalance.value = v
                          }}
                        />
                      </div>
                    </div>
                  )
                }
              })}
            </div>
          </div>
          {!paramsError && (
            <div class="order-pay__action-bar">
              <div class="content">
                {useBalance.value ? (
                  <div class="order-pay__summary">
                    <div class="total">需付：</div>
                    <div class="yen number-font">&yen;</div>
                    <div class="amount number-font">{needPayAmount.value.toFixed(2)}</div>
                    {discountAmount.value > 0 && (
                      <div class="discount">共优惠&nbsp;{formatPrice(discountAmount.value)}&nbsp;元</div>
                    )}
                    {useBalance.value && (
                      <div class="order-pay__balance-tip">
                        合计：{Number(paymentAmount.value).toFixed(2)} 元，使用余额抵扣 {balanceAmount.value.toFixed(2)}{' '}
                        元
                      </div>
                    )}
                  </div>
                ) : (
                  <div class="order-pay__summary">
                    <div class="total">合计：</div>
                    <div class="yen number-font">&yen;</div>
                    <div class="amount number-font">{Number(paymentAmount.value).toFixed(2)}</div>
                    {discountAmount.value > 0 && (
                      <div class="discount">共优惠&nbsp;{formatPrice(discountAmount.value)}&nbsp;元</div>
                    )}
                    {useBalance.value && (
                      <div class="order-pay__balance-tip">
                        余额抵扣 {balanceAmount.value.toFixed(2)} 元
                        {needPayAmount.value > 0 && `，还需要用支付 ${needPayAmount.value.toFixed(2)} 元`}
                      </div>
                    )}
                  </div>
                )}

                <div
                  class={[
                    'main-action',
                    notAvailableForPurchaseList.value.length !== 0 ? 'disable' : 'primary main-action-active'
                  ]}
                  onClick={submitValidation}
                >
                  提交订单
                </div>
              </div>
            </div>
          )}
        </BasePage>
      )
    }
  }
})
