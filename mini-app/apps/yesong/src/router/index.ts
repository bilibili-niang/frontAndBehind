import Taro, { useRouter } from '@tarojs/taro'
import { ORDER_ORIGIN_DETAIL } from '../constants'
import { OrderPayGoodsParams } from '../packageA/order/pay'
import {
  navigateTo,
  buildUrl,
  withLogin,
  emitter,
  withWechatBind,
  useLoading,
  useResponseMessage,
  useLoadingEnd
} from '@anteng/core'
import { useGlobalStore } from '../stores'
import {
  ROUTE_AFTER_SALE,
  ROUTE_AFTER_SALE_RESULT,
  ROUTE_CATEGORY,
  ROUTE_COUPONS,
  ROUTE_GOODS_GROUP,
  ROUTE_INDEX,
  ROUTE_INFORMATION_DETAIL,
  ROUTE_INFORMATION_LIST,
  ROUTE_POSTER,
  ROUTE_POSTER_MAKING_CREATE,
  ROUTE_POSTER_MAKING_LIST,
  ROUTE_PROFILE,
  ROUTE_SEARCH,
  ROUTE_SETTINGS,
  ROUTE_WALLET
} from './routes'
import { getPageKey, isThePage } from './utils'
import { editorPoster } from '../packageA/posterMaking/create/dataProcessing'
import { $getJdURL } from '../api/other'

export { isThePage, getPageKey }

// 回到首页，将清空路由栈
// export const backToIndex = (tabIndex?: number) => {
//   const url = tabIndex !== undefined ? `/packageMain/index?tabIndex=${tabIndex}` : '/packageMain/index'
//   Taro.reLaunch({
//     url: url
//   })
// }

export const navigateBack = () => {
  const path = (useRouter() as any)?.$taroPath
  setTimeout(() => {
    const newPath = (useRouter() as any)?.$taroPath
    if (isThePage(newPath, path)) {
      console.log('好像回不去了？', path, newPath)
    }
  }, 1000)
  Taro.navigateBack()
}

/** 返回主界面（Tab栏页） */
export const backToIndex = (tabKey?: string, force = false) => {
  if (tabKey) {
    useGlobalStore().toggleTab(tabKey)
  }
  const url = buildUrl('/packageMain/index', {
    tabKey: tabKey
  })
  if (process.env.TARO_ENV !== 'h5') {
    if (force) {
      Taro.reLaunch({
        url: url
      })
      return
    }
    try {
      Taro.navigateBack({
        delta: 100,
        fail: err => {
          console.log(err.errMsg)
          Taro.redirectTo({
            url: url
          })
        }
      })
    } catch (err) {}
  } else {
    // FIXME 这里可能会造成首页重新渲染？
    Taro.redirectTo({
      url: url
    })
  }
}

/** 跳转自定义页面 */
export const navigateToCustomPage = (id: string) => {
  navigateTo({
    url: `/packageMain/custom?id=${id}`
  })
}

/** 跳转到 h5 */
export const navigateToWebview = (url: string) => {
  if (process.env.TARO_ENV === 'h5') {
    window.location.href = url
    return void 0
  }

  navigateTo({
    url: `/packageMain/web?url=${encodeURIComponent(url)}`
  })
}

/** 重定向到 404 页面 */
export const redirectTo404 = () => {
  Taro.redirectTo({
    url: '/pages/404'
  })
}

/** 前往购物车页（独立页面，非 tab 页） */
export const navigateToShoppingCart = () => {
  const route = useRouter().path
  if (isThePage(route, ROUTE_INDEX)) {
    useGlobalStore().toggleTab('cart')
  } else {
    navigateTo({
      url: '/packageMain/cart'
    })
  }
}

/** 跳转到商品详情 */
export const navigateToGoodsDetail = (goodsId: string) => {
  navigateTo({
    url: `/packageA/goods/detail?gid=${goodsId}`
  })
}

/** 跳转到文创详情 */
export const navigateToCreativeDetail = (id: string, name?: string) => {
  navigateTo({
    url: buildUrl('/packageA/creative/detail/index', { id, name })
  })
}

/** 跳转到下单页面，需 1.登录 + 2.绑定微信 */
export const navigateToOrderPay = withLogin(
  withWechatBind((options: { origin?: number; goods: OrderPayGoodsParams | OrderPayGoodsParams[] }) => {
    const params = JSON.stringify(options.goods)
    navigateTo({
      url: `/packageA/order/pay/index?params=${params}&origin=${options.origin ?? ORDER_ORIGIN_DETAIL}`
    })
  })
)

/** 跳转到支付结果页面 */
export const navigateToPayResult = (options: {
  orderNo: string
  unifyOrderNo: string
  supplier?: string
  redirect?: boolean
}) => {
  // 注意! 因为微信小程序自身缺陷，必须至少延迟 500ms 以上，否则可能导致唤起微信支付后跳转页面导致 currentRoute 和当前页面不匹配。
  // @see https://github.com/NervJS/taro/issues/12421
  // @attention 因为获取不到路由信息，这里不可使用 useLoading、useLoadingEnd
  try {
    Taro.showLoading()
    setTimeout(() => {
      Taro.hideLoading()
      const url = buildUrl('/packageA/pay/result', {
        orderNo: options.orderNo,
        unifyOrderNo: options.unifyOrderNo,
        supplier: options.supplier
      })
      console.log('跳转到支付结果页面：', url)
      if (options.redirect) {
        Taro.redirectTo({ url })
      } else {
        navigateTo({
          url
        })
      }
    }, 600)
  } catch (err) {
    console.log('跳转订单支付结果页错误', err)
    Taro.hideLoading()
    redirectToOrderList()
  }
}

/** 跳转到订单列表 */
export const navigateToOrderList = (type?: number) => {
  navigateTo({
    url: buildUrl('/packageA/order/list/index', {
      type: type
    })
  })
}

/* 跳转到订单列表 */
export const redirectToOrderList = (type?: number) => {
  Taro.redirectTo({
    url: buildUrl('/packageA/order/list/index', {
      type: type
    })
  })
}

/** 跳转到订单详情 */
export const navigateToOrderDetail = (orderNo: string) => {
  navigateTo({
    url: `/packageA/order/detail/index?orderNo=${orderNo}`
  })
}

/** 重定向到订单详情 */
export const redirectToOrderDetail = (orderNo: string) => {
  Taro.redirectTo({
    url: `/packageA/order/detail/index?orderNo=${orderNo}`
  })
}

/** 跳转到商品列表页 */
export const navigateToGoodsList = (options: { keywords?: string }) => {
  navigateTo({
    url: buildUrl('/packageA/goods/list', {
      keywords: options.keywords
    })
  })
}

export const navigateToSearch = (options?: { redirect?: boolean; keywords?: string }) => {
  const routes = Taro.getCurrentPages()
  const lastRoute = routes[routes.length - 2]
  if (isThePage(lastRoute?.route, ROUTE_SEARCH)) {
    emitter.trigger(`setSearchKeywords:${getPageKey(lastRoute)}`, options?.keywords)
    navigateBack()
  } else {
    Taro[options?.redirect ? 'redirectTo' : 'navigateTo']({
      url: buildUrl(ROUTE_SEARCH, {
        keywords: options?.keywords
      })
    })
  }
}

/** 前往商品分组页 */
export const navigateToGoodsGroup = (id: string) => {
  navigateTo({
    url: buildUrl(ROUTE_GOODS_GROUP, {
      id: id
    })
  })
}

export const navigateToSettings = () => {
  navigateTo({
    url: ROUTE_SETTINGS
  })
}

export const navigateToCategory = () => {
  // TODO 这里要判断 上一页是首页 & 首页 tab 存在分类页
  navigateTo({
    url: ROUTE_CATEGORY
  })
}
export const navigateToProfile = () => {
  // TODO 这里要判断 上一页是首页 & 首页 tab 存在个人中心
  navigateTo({
    url: ROUTE_PROFILE
  })
}

export const navigateToAfterSale = (options: {
  mainOrderNo: string
  type?: number
  orders?: {
    orderNo: string
    reason: string
  }[]
}) => {
  navigateTo({
    url: buildUrl(ROUTE_AFTER_SALE, {
      mainOrderNo: options.mainOrderNo,
      type: options.type,
      orders: options.orders ? JSON.stringify(options.orders) : undefined
    })
  })
}

export const navigateToAfterSaleResult = (afterSaleOrderNo: string) => {
  navigateTo({
    url: buildUrl(ROUTE_AFTER_SALE_RESULT, {
      afterSaleOrderNo
    })
  })
}
// 看钱包是需要登录的
export const navigateToWallet = withLogin(() => {
  navigateTo({
    url: ROUTE_WALLET
  })
})
// 看卡券列表也要登录
export const navigateToCoupon = withLogin(() => {
  navigateTo({
    url: ROUTE_COUPONS
  })
})

// 资讯列表
export const navigateToInformationList = (key?: string) => {
  navigateTo({
    url: ROUTE_INFORMATION_LIST + `?key=${key}`
  })
}
// 资讯详情
export const navigateToInformationDetail = (id?: string) => {
  navigateTo({
    url: ROUTE_INFORMATION_DETAIL + `?id=${id}`
  })
}

/** 跳转到社区图文详情 */
export const navigateToCommunityDetail = (id: string) => {
  navigateTo({
    url: buildUrl('/packageA/community/detail/index', { id })
  })
}
// 海报分享页面
export const navigateToPoster = (id: string) => {
  navigateTo({
    url: ROUTE_POSTER + `?gid=${id}`
  })
}

// 海报制作列表页
export const navigateToPosterMakingList = () => {
  navigateTo({
    url: ROUTE_POSTER_MAKING_LIST
  })
}
// 跳转制作海报 数据不是很多,可以用路径传参
export const navigateToPosterMakingCreate = (item?: {
  id: string
  qrcode: {
    x: number
    y: number
    size: number
    page: string
    goodsId: string
    utm: string
    faId: string
    childrenId: string
    infId
    string
  }
  url: string
}) => {
  if (item?.id) {
    editorPoster.value = {
      ...item,
      isEdit: true
    }
    navigateTo({
      url: ROUTE_POSTER_MAKING_CREATE + `?id=${item.id}`
    })
  } else {
    navigateTo({
      url: ROUTE_POSTER_MAKING_CREATE
    })
  }
}

/** 跳转到京东订单列表 */
export const navigateToJdOrderList = withLogin(() => {
  useLoading()
  $getJdURL(1)
    .then(res => {
      if (res.data) {
        navigateToWebview(res.data)
      } else {
        useResponseMessage(res)
      }
    })
    .catch(useResponseMessage)
    .finally(useLoadingEnd)
})

/** 我的优惠券 */
export const navigateToDiscountCouponList = withLogin(() => {
  navigateTo({
    url: '/packageA/discount-coupon/list'
  })
})

/** 跳转到优惠券模板领取／去使用 */
export const navigateToCouponUsage = (params: { recordNo?: string; templateId?: string }) => {
  navigateTo({
    url: buildUrl('/packageA/discount-coupon/usage/index', params)
  })
}
