import { computed, inject, provide, reactive, readonly, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { getGoodsDetail } from '../../../api/goods'
import { cloneDeep } from 'lodash-es'
import Taro from '@tarojs/taro'
import { IGoodsDetail } from '../../../api/goods/types'
import { WxAddress } from '../../../types'
import { PAYMENT_METHOD_NONE, SUB_PAYMENT_METHOD_OPTIONS } from '@pkg/config'
import useMerchantStore from '../../../stores/merchant'
import { useOrderCouponSelector } from './coupon-selector'

const stores: {
  [key: string]: ReturnType<typeof defineOrderPayStore>
} = {}

export type OrderPayGoodsItem = {
  /** 商品id */
  goodsId: string
  /** sku */
  skuId: string
  /** 数量 */
  count: number
}

/** 定义下单页面全局状态 store */
export const defineOrderPayStore = (orderPayPageId: string) =>
  defineStore(`order-pay-${orderPayPageId}`, () => {
    const goodsList = ref<OrderPayGoodsItem[]>([])
    /** 初始化下单商品列表，在页面进入时获取链接参数 */
    const initList = (list: OrderPayGoodsItem[]) => {
      goodsList.value = cloneDeep(list)
      goodsList.value.forEach(item => {
        getGoodsDetailById(item.goodsId)
      })
    }

    const isLoading = ref(true)

    /** 商品详情映射 */
    const goodsDetailMap = ref<Record<string, IGoodsDetail>>({})
    const goodsDetailFailedMap = ref<Record<string, boolean>>({})
    /** 获取商品详情 */
    const getGoodsDetailById = (goodsId: string, forceReload = false) => {
      if (goodsDetailFailedMap.value[goodsId] === false && !forceReload) return void 0
      goodsDetailFailedMap.value[goodsId] = false
      getGoodsDetail(goodsId)
        .then(res => {
          if (res.code === 200) {
            goodsDetailMap.value[goodsId] = res.data
          } else {
            goodsDetailFailedMap.value[goodsId] = true
            console.error(res)
          }
        })
        .catch(err => {
          goodsDetailFailedMap.value[goodsId] = true
          console.error(err)
        })
        .finally(() => {
          isLoading.value = false
        })
    }

    /** 收货人地址信息 */
    const address = reactive<WxAddress>({
      /** 省份 */
      provinceName: null,
      /** 市 */
      cityName: null,
      /** 区 */
      countyName: null,
      /** 详细地址 */
      detailInfo: null,
      /** 收件人姓名 */
      userName: null,
      /** 电话号码 */
      telNumber: null
    })
    /** 设置收货人地址信息 */
    const setAddress = (options: Partial<typeof address>) => {
      Object.assign(address, options)
      Taro.setStorageSync('lastAddress', JSON.stringify(options))
    }

    /*try {
     const lastAddress = JSON.parse(Taro.getStorageSync('lastAddress'))
     lastAddress && setAddress(lastAddress)
     } catch (err) {
     setAddress({
     provinceName: null,
     cityName: null,
     countyName: null,
     detailInfo: null,
     userName: null,
     telNumber: null
     })
     }*/

    /** 定单备注 */
    const remark = ref('')
    /** 余额 */
    const useBalance = ref(false)

    // 默认微信支付
    const subPayMethod = ref()

    // 支付方式适配
    const payMethodAdapter = (methods: string | any[] = []) => {
      return Array.from(
        new Set((Array.isArray(methods) ? methods.map(i => i.type ?? i.value) : methods.split(',')).map(i => Number(i)))
      )
    }

    const availableSubPayMethod = computed(() => {
      const channels = payMethodAdapter(useMerchantStore().merchantOrderFlow?.paySubChannel)
      const res = SUB_PAYMENT_METHOD_OPTIONS.filter(item => channels.includes(item.value))
      return res.length > 0 ? res : [SUB_PAYMENT_METHOD_OPTIONS[0]]
    })

    const availablePayMethod = computed(() => {
      const payChannel = payMethodAdapter(useMerchantStore().merchantOrderFlow?.payChannel)
      return payChannel.filter(i => i !== PAYMENT_METHOD_NONE)
    })

    watch(
      () => [subPayMethod.value, availableSubPayMethod.value],
      () => {
        // 加载支付方式后如果没有微信支付，切换为第一个可用支付方式
        if (!availableSubPayMethod.value.some(item => item.value === subPayMethod.value)) {
          subPayMethod.value = availableSubPayMethod.value[0]?.value
        }
      },
      { immediate: true }
    )

    const totalAmount = computed(() => {
      const goodsPrice =
        goodsList.value.reduce((v, item) => {
          return (
            v +
            Number(goodsDetailMap.value[item.goodsId]?.goodsSkus.find(sku => sku.id === item.skuId)?.price! ?? 0) *
            item.count *
            100
          )
        }, 0) / 100

      return Number.isNaN(Number(goodsPrice)) ? 0 : goodsPrice
    })

    /** 需支付金额 */
    const paymentAmount = computed(() => {
      return totalAmount.value - discountAmount.value
    })

    const goodsCount = computed(() => {
      return goodsList.value.reduce((v, item) => {
        return v + item.count
      }, 0)
    })

    /** 总优惠金额 */
    const discountAmount = computed(() => {
      if (!currentCoupon.value) {
        return 0
      }

      const v = currentCoupon.value.discountAmount / 100

      if (v >= totalAmount.value) {
        // 至少付0.01
        return totalAmount.value - 0.01
      }

      return v
    })

    const { SelectCouponButton, currentCoupon } = useOrderCouponSelector(() => goodsList.value)

    return {
      pageId: orderPayPageId,
      isLoading,
      goodsList,
      initList,
      goodsDetailMap,
      goodsDetailFailedMap,
      address: readonly(address),
      remark,
      useBalance,
      availableSubPayMethod,
      subPayMethod,
      totalAmount,
      paymentAmount,
      discountAmount,
      goodsCount,
      setAddress,
      availablePayMethod,
      SelectCouponButton,
      currentCoupon
    }
  })

export const useOrderPayStore = (
  orderPayPageId?: string,
  ...args: Parameters<ReturnType<typeof defineOrderPayStore>>
) => {
  if (orderPayPageId) {
    try {
      provide('orderPayPageId', orderPayPageId)
    } catch (err) {
    }
  }
  const pageId = orderPayPageId ?? inject('orderPayPageId')
  if (!pageId) {
    throw new Error('useOrderPayStore 必须在订单确认页内使用，或手动传入页面Id')
  }
  const name = `order-pay-${pageId}`
  if (stores[name]) {
    return stores[name](...args)
  }
  const store = defineOrderPayStore(pageId)
  stores[name] = store
  return store(...args)
}
