import { computed, inject, onMounted, onUnmounted, provide, ref, watch } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { getGoodsDetail as requestGetGoodsDetail } from '../../../api/goods'
import { IGoodsDetail } from '../../../api/goods/types'
import Taro from '@tarojs/taro'
import { COMMON_STATUS_OFF, GOODS_ON_SALE_MODE_TIMING } from '../../../constants'
import dayjs from 'dayjs'
import { safeParse, useAppStore, usePagination, useTiming, useToast, useUserStore, withLogin } from '@pkg/core'
import { safeDayjs } from '@pkg/utils'
import { WxAddress } from '../../../types'
import { $getDiscountCouponReceiveList } from '../../../api/discount-coupon'

const stores: {
  [key: string]: ReturnType<typeof defineGoodsDetailStore>
} = {}

/** 定义下单页面全局状态 store */
export const defineGoodsDetailStore = (goodsId: string) =>
  defineStore(`goods-detail-${goodsId}`, () => {
    const appStore = useAppStore()
    const { lazyNow } = storeToRefs(appStore)

    const isLoading = ref(false)
    const errorMsg = ref('')
    const goodsDetail = ref<IGoodsDetail>()

    const storageLastAddress = Taro.getStorageSync('lastAddress')
    const lastAddress = storageLastAddress ? (safeParse(storageLastAddress) as WxAddress) : null
    // 当前页面共享的用户地址
    const pageAddress = ref<WxAddress | null>(lastAddress)
    // 更改用户地址
    const updatePageAddress = withLogin(() => {
      Taro.chooseAddress({
        success: res => {
          pageAddress.value = res
          Taro.setStorageSync('lastAddress', res)
        },
        fail: () => {
          // TODO 支持 H5 设置收货地址，微信 H5 可以使用 wx.openAddress 能力
          if (process.env.TARO_ENV === 'h5') {
            useToast('h5暂未支持地址选择2')
          }
        },
        complete: () => {}
      })
    })

    const getGoodsDetail = async (options?: { silentRefresh?: boolean }) => {
      if (!goodsId) {
        return Promise.reject(new Error('缺失 GoodsId '))
      }
      if (!options?.silentRefresh) {
        isLoading.value = true
      }
      errorMsg.value = ''
      try {
        const res = await requestGetGoodsDetail(goodsId)
        if (res.code === 200) {
          goodsDetail.value = res.data
        } else {
          errorMsg.value = res.msg
          return Promise.reject(new Error(res.msg))
        }
      } catch (err) {
        if (err.response?.data?.msg) {
          errorMsg.value = err.response.data.msg
          return Promise.reject(err.response.data.msg)
        }
        return Promise.reject(err)
      } finally {
        isLoading.value = false
      }
    }

    /** 静默刷新 */
    const silentRefresh = () => {
      appStore.resetLazyNow()
      return getGoodsDetail({ silentRefresh: true })
    }

    /** 是否已下架 */
    const isOffSale = computed(() => {
      return goodsDetail.value?.status === COMMON_STATUS_OFF
    })

    /** 是否限时售卖 */
    const isSaleTimeLimited = computed(() => {
      return goodsDetail.value?.onsaleMode === GOODS_ON_SALE_MODE_TIMING
    })
    /** 限时售卖：待开售 */
    const isWaitingForSale = computed(() => {
      if (!isSaleTimeLimited.value || !goodsDetail.value?.onsaleStartAt) return false
      return lazyNow.value.isBefore(dayjs(goodsDetail.value.onsaleStartAt))
    })
    /** 限时售卖：售卖结束 */
    const isEndOfSale = computed(() => {
      if (!isSaleTimeLimited.value || !goodsDetail.value?.onsaleEndAt) return false
      return lazyNow.value.isAfter(dayjs(goodsDetail.value.onsaleEndAt))
    })

    /** 停止监听当天售卖时间始末点自动刷新定时器 */
    let stopSalesTimeRefresh = () => {}
    /** 在当天售卖时间内 */
    const isWithinTodaySalesTime = computed(() => {
      const { buyStartAt, buyEndAt } = goodsDetail.value!
      if (buyStartAt && buyEndAt) {
        const start = safeDayjs(buyStartAt)
        const end = safeDayjs(buyEndAt)
        if (lazyNow.value.isBefore(start)) {
          stopSalesTimeRefresh()
          // 设定当日售卖时间开始定时器，到达后重新触发计算
          const { stopTimeout } = useTiming(buyStartAt, () => {
            appStore.resetLazyNow()
          })
          stopSalesTimeRefresh = stopTimeout
          return false
        } else if (lazyNow.value.isAfter(end)) {
          return false
        }
        const result = lazyNow.value.isAfter(start) && lazyNow.value.isBefore(end)
        if (result) {
          stopSalesTimeRefresh()
          // 设定当日售卖时间结束定时器，到达后重新触发计算
          const { stopTimeout } = useTiming(buyEndAt, () => {
            appStore.resetLazyNow()
          })
          stopSalesTimeRefresh = stopTimeout
        }
        return result
      }
      return true
    })

    /** 是否在售 */
    const isOnSale = computed(() => {
      if (isEndOfSale.value) {
        return false
      }
      if (isSaleTimeLimited.value) {
        return !isWaitingForSale.value && !isEndOfSale.value
      }
      return true
    })

    /** 经过二次计算的商品Sku列表，额外包含多个以 $ 开头命名的属性 */
    const goodsSkus = computed(() => {
      if (!goodsDetail.value) return []
      const minCount = goodsDetail.value.limitNumMin

      return goodsDetail.value.goodsSkus?.map(item => {
        return {
          ...item,
          /** 规格ID路径 */
          $path: item.specs.map(spec => spec.vId).join(','),
          /** 规格名 */
          $name: item.specs.map(spec => spec.v).join(','),
          /** 规格图片，若未设置则为主图第一张 */
          $image: item.specs[0].image ?? goodsDetail.value?.coverImages[0],
          /** 售罄，缺货 */
          $soldOut: item.stock === 0 || item.stock < minCount
        }
      })
    })

    // store 被销毁前需移除事件循环中的引用（包含但不限于定时器），使得内存能够被正确回收
    // 如果打开多个相同的商品详情页面，这些依赖的是同一个 store，只有当最后一个依赖源被销毁后才会触发 onUnmounted 钩子
    onUnmounted(() => {
      stopSalesTimeRefresh()
    })

    const promotionPagination = usePagination({
      requestHandler: params => {
        return $getDiscountCouponReceiveList({
          ...params,
          size: 100,
          goodsId: goodsId,
          // supplierId: ,
          showStatus: true
        })
      }
    })

    onMounted(() => {
      // 立即获取优惠券，与商品详情接口并发
      promotionPagination.fetchData()
    })

    const getPromotionPagination = () => {
      return promotionPagination
    }

    const userSore = useUserStore()

    watch(
      () => userSore.isLogin,
      () => {
        // 登录状态变更，刷新优惠券列表
        promotionPagination.refreshData()
      }
    )

    return {
      goodsId,
      goodsDetail,
      getGoodsDetail,
      pageAddress,
      updatePageAddress,
      refresh: getGoodsDetail,
      silentRefresh,
      isLoading,
      errorMsg,
      goodsSkus,
      isOffSale,
      isOnSale,
      isWaitingForSale,
      isEndOfSale,
      isSaleTimeLimited,
      isWithinTodaySalesTime,
      getPromotionPagination
    }
  })

export const useGoodsDetailStore = (
  goodsId?: string,
  ...args: Parameters<ReturnType<typeof defineGoodsDetailStore>>
) => {
  if (goodsId) {
    try {
      provide('goodsId', goodsId)
    } catch (err) {}
  }
  const pageId = goodsId ?? inject('goodsId')
  if (!pageId) {
    throw new Error('useGoodsDetailStore 必须在商品详情页内使用，或手动传入商品Id')
  }
  // TODO 如果重复进入同一个商品详情会怎么样？
  const name = `goods-detail-${pageId}`
  if (stores[name]) {
    return stores[name](...args)
  }
  const store = defineGoodsDetailStore(pageId)
  stores[name] = store
  return store(...args)
}

export const useGoodsDetailStoreDispose = (store: ReturnType<typeof useGoodsDetailStore>) => {
  const goodsId = store.goodsId
  delete stores[`goods-detail-${goodsId}`]
  const pages = Taro.getCurrentPages()
  const t = pages.find(item => {
    return (
      (item.route === '/goods/detail' || item.route === 'packageA/goods/detail') && item.$taroParams.gid === goodsId
    )
  })
  if (t) {
    return void 0
  }
  console.log(`[Pinia]：移除 goods-detail-${goodsId}`)
  store.$dispose()
}
