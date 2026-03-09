// log 拦截
import './src/utils/log'
// 时间偏移
import './src/utils/date-offset'

import Taro, { nextTick } from '@tarojs/taro'
import { QuickMenuItem } from './lib'
import useCoreStore, { GlobalShareHandler } from './src/stores/core'

import './src/setup'

export {
  default as commonRequest,
  default as request,
  type RequestPagination,
  type ResponseBody,
  type ResponseData,
  type PaginationData,
  type ResponsePaginationData
} from './src/api/request'

export { $getMerchantId, $OCR_License } from './src/api'

export { $getIndustry, standardIndustryData, getIndustryName } from './src/api'

export * from './src/api/coupon'

// 常量
export * from './src/constants'

export * from './src/utils/index'
export { default as emitter } from './src/utils/emitter'
export * from './src/utils/weapp'
export * from './src/utils/router'
export * from './src/utils/image-process'
export { onTabPageActivated } from './src/utils/onTabPageActivated'
export * from './src/utils/onPageShow'
export * from './src/utils/webview-bridge'

// 翻页scroll
export { default as ScrollList, type ScrollListRefType } from './src/components/scroll-list'

export {
  default as NavigationScrollList,
  type navigationItemType,
  type navigationIRefType
} from './src/components/navigation-scroll-list'

export { default as ScrollAnchor } from './src/components/scroll-anchor'

// 钩子
export * from './src/hooks'
export { useShareAppMessage, useShareAppMessageBus } from './src/hooks/useShareAppMessage'

// 状态
export * from './src/stores'

// 视图
export * from './src/views'

// 组件
export { default as LaunchPage } from './src/components/launch-page'

export { default as BasePage } from './src/components/base-page'
export { default as WebView } from './src/components/web-view'
export { default as TabPage, CommonTab, useCommonTab, type TabPageItem } from './src/components/tab-page'

export { default as TabBar, type ITabBarItem } from './src/components/tab-bar'

export { type PopupConfig, type PopupFunc } from './src/components/base-page/popup'

export { default as EmptyStatus, EmptyAction } from './src/components/empty-status'

export { default as Spin } from './src/components/spin'

export { default as RichText } from './src/components/rich-text'
export { default as ImageUploader } from './src/components/image-uploader'

export { CommonProfileHeader } from './src/components/profile-header'

const ice = {
  /** 设置快捷导航默认功能项，请确保在 Pinia 挂载后使用 */
  setQuickMenuList: (list: QuickMenuItem[]) => {
    useCoreStore().setQuickMenuList(list)
  },
  /** 设置全局默认分享回调 */
  setDefaultShare: (handler: GlobalShareHandler) => {
    useCoreStore().setGlobalShareHandler(handler)
  },
  /** 隐藏分享按钮 */
  hideShareMenu: () => {
    if (process.env.TARO_ENV !== 'h5') {
      nextTick(() => {
        useCoreStore().setDisabledSharePage(ice.getPageId()!, true)
      })
      return Taro.hideShareMenu()
    }
  },
  /** 显示分享按钮 */
  showShareMenu: (options?: Taro.showShareMenu.Option) => {
    if (process.env.TARO_ENV !== 'h5') {
      nextTick(() => {
        useCoreStore().setDisabledSharePage(ice.getPageId()!, false)
      })
      return Taro.showShareMenu(options ?? {})
    }
    // TODO h5 使用 wx jssdk 实现
  },
  getPageId: () => {
    return useCoreStore().getPageId()
  }
}

export default ice

export * from './src/components/dev'

export const SCENE_STORE = 'store'
export const ORIGIN_STORE = 'store'

export const useAction = (action: any) => {
  console.log(action)
}