import './components/deck'

import anteng, { useAppStore } from '@anteng/core'

import {
  QUICK_MENU_ITEM_CATEGORY,
  QUICK_MENU_ITEM_FEEDBACK,
  QUICK_MENU_ITEM_HOME,
  QUICK_MENU_ITEM_PROFILE,
  QUICK_MENU_ITEM_SEARCH,
  QUICK_MENU_ITEM_SERVICE,
  QUICK_MENU_ITEM_SHARE,
  QUICK_MENU_ITEM_CART,
  QUICK_MENU_ITEM_ORDERS,
  QUICK_MENU_ITEM_SETTINGS
} from './constants/quick-menu'
import { DEFAULT_SHARE_PAYLOAD } from './constants/share'

export default () => {
  // 注册快捷导航默认项
  anteng.setQuickMenuList(
    process.env.TARO_ENV === 'h5'
      ? [
          QUICK_MENU_ITEM_HOME,
          QUICK_MENU_ITEM_SEARCH,
          QUICK_MENU_ITEM_CATEGORY,
          QUICK_MENU_ITEM_PROFILE,
          QUICK_MENU_ITEM_CART,
          QUICK_MENU_ITEM_ORDERS
        ]
      : [
          QUICK_MENU_ITEM_HOME,
          QUICK_MENU_ITEM_SEARCH,
          QUICK_MENU_ITEM_SHARE,
          QUICK_MENU_ITEM_CATEGORY,
          QUICK_MENU_ITEM_PROFILE,
          QUICK_MENU_ITEM_CART,
          QUICK_MENU_ITEM_ORDERS,
          QUICK_MENU_ITEM_SERVICE,
          QUICK_MENU_ITEM_FEEDBACK,
          QUICK_MENU_ITEM_SETTINGS
        ]
  )

  anteng.setDefaultShare(() => {
    // console.log(payload)
    return {
      ...DEFAULT_SHARE_PAYLOAD
      // TODO 这里可以定义一个异步函数，通过接口根据路径、参数来获取分享信息。
      // promise
    }
  })

  useAppStore().setTheme('rose')
}
