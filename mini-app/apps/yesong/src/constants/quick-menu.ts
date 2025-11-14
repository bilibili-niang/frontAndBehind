import { QuickMenuItem } from '@anteng/core'
import {
  backToIndex,
  navigateToCategory,
  navigateToOrderList,
  navigateToProfile,
  navigateToSearch,
  navigateToSettings,
  navigateToShoppingCart
} from '../router'

export const QUICK_MENU_ITEM_HOME: QuickMenuItem = {
  key: 'index',
  name: '首页',
  icon: 'home-active',
  handler: () => {
    backToIndex()
  }
}

export const QUICK_MENU_ITEM_SEARCH: QuickMenuItem = {
  key: 'search',
  name: '搜索',
  icon: 'search',
  handler: () => {
    navigateToSearch()
  }
}

export const QUICK_MENU_ITEM_SHARE: QuickMenuItem = {
  key: 'share',
  name: '分享',
  icon: 'share',
  openType: 'share'
}

export const QUICK_MENU_ITEM_CATEGORY: QuickMenuItem = {
  key: 'category',
  name: '分类',
  icon: 'category',
  handler: () => {
    navigateToCategory()
  }
}

export const QUICK_MENU_ITEM_PROFILE: QuickMenuItem = {
  key: 'profile',
  name: '个人中心',
  icon: 'profile',
  handler: () => {
    navigateToProfile()
  }
}

export const QUICK_MENU_ITEM_CART: QuickMenuItem = {
  key: 'cart',
  name: '购物车',
  icon: 'cart',
  handler: () => {
    navigateToShoppingCart()
  }
}
export const QUICK_MENU_ITEM_GOODS: QuickMenuItem = {
  key: 'goods-list',
  name: '全部商品',
  icon: 'icon-lose',
  handler: () => {}
}
export const QUICK_MENU_ITEM_ORDERS: QuickMenuItem = {
  key: 'order-list',
  name: '我的订单',
  icon: 'order',
  handler: () => {
    navigateToOrderList()
  }
}
export const QUICK_MENU_ITEM_SERVICE: QuickMenuItem = {
  key: 'contact',
  name: '客服',
  icon: 'custom-service',
  openType: 'contact'
}
export const QUICK_MENU_ITEM_FEEDBACK: QuickMenuItem = {
  key: 'feedback',
  name: '用户反馈',
  icon: 'help',
  openType: 'feedback'
}

export const QUICK_MENU_ITEM_SETTINGS: QuickMenuItem = {
  key: 'feedback',
  name: '设置',
  icon: 'settings',
  handler: () => {
    navigateToSettings()
  }
}
