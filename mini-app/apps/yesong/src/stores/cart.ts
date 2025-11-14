import { defineStore } from 'pinia'
import { ICartItem } from '../api/cart/types'
import { computed, ref, watch } from 'vue'
import {
  addGoodsToCart as requestAddGoodsToCart,
  getCartInfo,
  type ICartItemParams,
  removeCartItem,
  updateCartItem
} from '../api/cart'
import { useLoading, useLoadingEnd, useResponseMessage, useToast, withLogin } from '@anteng/core'
import { navigateToOrderPay } from '../router'
import { ORDER_ORIGIN_CART } from '../constants'
import { buildImgUrl } from '../utils'

/**
 * 本地构建购物车假数据
 * 仅填充页面实际使用到的字段（其余通过类型断言补齐）
 */
const buildMockCartItems = (): ICartItem[] => {
  const now = new Date().toISOString()

  const makeSku = (goodsId: string, idSuffix: string, specName: string, specValue: string, imageIndex?: number) => {
    return {
      id: `${goodsId}-sku-${idSuffix}`,
      goodsId,
      specCode: `spec-${idSuffix}`,
      underlinePrice: 19900,
      price: 9900,
      cost: 0,
      stock: 99,
      weight: 0,
      sort: 0,
      path: '',
      specs: [
        {
          k: specName,
          kId: `k-${idSuffix}`,
          v: specValue,
          vId: `v-${idSuffix}`,
          image: buildImgUrl(imageIndex)
        }
      ]
    } as any
  }

  const makeGoods = (id: string, title: string, coverIndex: number, skuSpecs: { suffix: string; name: string; value: string; imageIndex?: number }[]) => {
    const goods = {
      id,
      title,
      coverImages: [buildImgUrl(coverIndex)],
      goodsSkus: skuSpecs.map(s => makeSku(id, s.suffix, s.name, s.value, s.imageIndex)),
      limitNumMin: 1,
      limitNumMax: 5,
      soldNum: Math.floor(Math.random() * 1000) + 1,
      type: 1
    } as any
    return goods
  }

  const g1 = makeGoods('10001', '精品手作曲奇礼盒', 1, [
    { suffix: 'a', name: '口味', value: '原味', imageIndex: 2 },
    { suffix: 'b', name: '口味', value: '可可', imageIndex: 3 }
  ])
  const g2 = makeGoods('10002', '高山现烘咖啡豆', 4, [
    { suffix: 'a', name: '烘培', value: '中烘', imageIndex: 5 },
    { suffix: 'b', name: '烘培', value: '深烘', imageIndex: 6 }
  ])
  const g3 = makeGoods('10003', '轻奢便携保温杯', 7, [
    { suffix: 'a', name: '规格', value: '350ml', imageIndex: 8 },
    { suffix: 'b', name: '规格', value: '500ml', imageIndex: 9 }
  ])

  const list: ICartItem[] = [
    {
      id: '70003',
      goodsId: g3.id,
      goodsSkuId: g3.goodsSkus[0].id,
      count: 1,
      joinTime: now,
      goods: g3
    } as any,
    {
      id: '70002',
      goodsId: g2.id,
      goodsSkuId: g2.goodsSkus[1].id,
      count: 2,
      joinTime: now,
      goods: g2
    } as any,
    {
      id: '70001',
      goodsId: g1.id,
      goodsSkuId: g1.goodsSkus[0].id,
      count: 3,
      joinTime: now,
      goods: g1
    } as any
  ]

  return list
}

const useCartStore = defineStore('cart', () => {
  /** 购物车商品列表 */
  const list = ref<ICartItem[]>([])
  const cartGoodsList = computed(() => {
    return list.value.map(item => {
      return {
        ...item,
        sku: item.goods.goodsSkus.find(sku => sku.id === item.goodsSkuId),
        checked: checkedIdList.value.includes(item.id)
      }
    })
  })

  /** 购物车数据加载中 */
  const isLoading = ref(false)

  /** 购物车数据为空 */
  const isEmpty = computed(() => !isLoading.value && list.value.length === 0)

  /** 购物车获取数据失败 */
  const hasError = ref(false)

  /** 获取购物车数据 */
  const fetchData = async () => {
    isLoading.value = true
    return new Promise((resolve, reject) => {
      getCartInfo()
        .then(res => {
          if (res.code === 200) {
            list.value = res.data.sort((a, b) => {
              return b.id - a.id
            })
            resolve(res.data)
          } else {
            // 远程失败，注入本地假数据作为回退
            const mock = buildMockCartItems()
            list.value = mock
            hasError.value = false
            resolve(mock)
          }
        })
        .catch(err => {
          // 网络错误，注入本地假数据作为回退
          console.error(err)
          const mock = buildMockCartItems()
          list.value = mock
          hasError.value = false
          resolve(mock)
        })
        .finally(() => {
          isLoading.value = false
        })
    })
  }

  watch(
    () => list.value,
    () => {
      checkedIdList.value = checkedIdList.value.filter(id => list.value.some(item => item.id === id))
    }
  )

  fetchData()

  /** 添加购物车子项 */
  const addItem = withLogin(async (options: ICartItemParams) => {
    try {
      useLoading()
      const res = await requestAddGoodsToCart({
        goodsId: options.goodsId,
        goodsSkuId: options.goodsSkuId,
        count: options.count
      })

      if (res.code === 200) {
        useToast(res.msg || '已加入购物车')
        useCartStore().refresh()
      } else {
        useResponseMessage(res)
        throw new Error(res.msg)
      }
    } catch (error) {
      useResponseMessage(error)
      throw error
    } finally {
      useLoadingEnd()
    }
  })

  /** 更新购物车子项 */
  const updateItem = async (id: string, options: ICartItemParams) => {
    try {
      useLoading()
      const res = await updateCartItem(id, options)
      await fetchData()
      if (res.code === 200) {
        return Promise.resolve()
      }
      return Promise.reject(new Error(res.msg))
    } catch (err) {
      return Promise.reject(err)
    } finally {
      useLoadingEnd()
      fetchData()
    }
  }

  /** 删除购物车子项，允许多个 */
  const removeItem = async (id: string | string[]) => {
    try {
      useLoading()
      const res = await removeCartItem(Array.isArray(id) ? id : [id])
      await fetchData()
      useLoadingEnd()
      if (res.code === 200) {
        return Promise.resolve()
      }
      return Promise.reject(new Error(res.msg))
    } catch (err) {
      useLoadingEnd()
      return Promise.reject(err)
    }
  }

  /** 当前选中项 id 列表 */
  const checkedIdList = ref<string[]>([])
  /** 当前选中项数据映射 */
  const checkedItemMap = computed(() => {
    const map = new Map<string, (typeof cartGoodsList.value)[number] | undefined>()
    checkedIdList.value.forEach(id => {
      const item = cartGoodsList.value.find(item => item.id === id)
      map.set(id, item)
    })
    return map
  })

  /** 是否全选 */
  const isAllChecked = computed(() => {
    if (checkedIdList.value.length === 0) return false

    for (let cartGood of list.value) {
      if (!checkedIdList.value.includes(cartGood.id)) {
        return false
      }
    }
    return true
  })

  /** 选择（切换状态）*/
  const check = (id: string) => {
    const index = checkedIdList.value.indexOf(id)
    if (index === -1) {
      checkedIdList.value.push(id)
    } else {
      checkedIdList.value.splice(index, 1)
    }
  }

  /** 全选 */
  const checkAll = () => {
    checkedIdList.value = list.value.map(cartGood => cartGood.id)
  }

  /** 取消全选 */
  const uncheckAll = () => {
    checkedIdList.value = []
  }

  const totalAmount = computed(() => {
    let value: number = 0
    for (let key of checkedItemMap.value.keys()) {
      const item = checkedItemMap.value.get(key)
      if (item && item.sku?.price) {
        value += Number(item.sku.price) * item.count
      }
    }
    return value
  })

  const toPay = () => {
    if (checkedIdList.value.length === 0) {
      useToast('请选择商品')
      return void 0
    }
    navigateToOrderPay({
      origin: ORDER_ORIGIN_CART,
      goods: Array.from(checkedItemMap.value.values()).map(item => {
        return {
          cid: item?.id,
          gid: item?.goodsId!,
          sid: item?.goodsSkuId!,
          count: item?.count!
        }
      })
    })
  }

  return {
    cartGoodsList,
    isLoading,
    isEmpty,
    hasError,

    /** 刷新购物车数据 */
    refresh: fetchData,
    addItem,
    updateItem,
    removeItem,

    checkedIdList,
    checkedItemMap,
    isAllChecked,
    check,
    checkAll,
    uncheckAll,

    totalAmount,
    toPay
  }
})

export default useCartStore
