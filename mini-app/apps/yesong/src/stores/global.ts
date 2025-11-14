import { defineStore } from 'pinia'
import { safeParse, useTabBar } from '@anteng/core'
import { computed, ref } from 'vue'
import pkg from '../../package.json'
import Taro from '@tarojs/taro'
import requestGetIndexTabs from '../api/deck/getIndexTab'
import { MAIN_PAGE_TABS } from '../constants/main-tab'

const useGlobalStore = defineStore('store-global', () => {
  /** 当前版本号，取自 package.json "version" */
  const version = pkg.version

  /** 启动页完成加载后默认重定向路由 */
  const launchRedirect = ref('/packageMain/index')
  /** 设置启动页重定向路由（可能通过分享等途径进入，需要返回该页面） */
  const setLaunchRedirect = (url: string) => {
    // 避免卡在启动页无法重定向
    if (url.includes('pages/launch')) return void 0
    launchRedirect.value = url.startsWith('/') ? url : `/${url}`
  }
  /** 重定向到入口页（最初打开页面的链接） */
  const redirectToLaunchRedirect = () => {
    Taro.redirectTo({
      url: launchRedirect.value
    })
  }

  /** 首页 Tab 配置 */
  const indexTabConfig = ref()
  const getIndexTabs = () => {
    requestGetIndexTabs()
      .then(res => {
        if (res.code === 200 && res.data) {
          const config = typeof res.data.items === 'string' ? safeParse(res.data.items) : res.data.items
          indexTabConfig.value = config

        } else {
          console.error('获取首页导航栏失败：', res)
        }
      })
      .catch(err => {
        console.error('获取首页导航栏失败：', err)
      })
  }

  /**
   * TabBar 切换控制
   * 存在 action 则说明是跳转function
   * */
  const { tabs, currentTab, loadedTab, toggleTab } = useTabBar({
    current: 'home',
    tabs: computed(
      () =>
        indexTabConfig.value?.list.map((item: any) => {
          if (!item) return {}
          // 对数据进行适配：支持系统页（key）与自定义页（id）
          const systemKey = item?.page?.id?.key ?? item?.page?.id ?? ''
          const customId = item?.page?.id?.id ?? undefined
          const defaultIcons = MAIN_PAGE_TABS.find(t => t.key === systemKey)
          // 优先使用后端返回的 uri（相对路径），以便前端拼接域名
          const normalIcon = item.icon?.normal?.uri ?? item.icon?.normal?.url
          const activeIcon = item.icon?.active?.uri ?? item.icon?.active?.url
          const iconWidth = item?.iconWidth ?? 35
          const iconHeight = item?.iconHeight ?? 35
          return {
            key: systemKey || customId,
            id: customId,
            text: item.text,
            activeText: item?.activeText,
            icon: normalIcon ?? defaultIcons?.icon,
            activeIcon: activeIcon ?? defaultIcons?.activeIcon,
            iconWidth,
            iconHeight,
            iconScale: item?.iconScale,
            action: item?.action || false,
            actionEnable: item?.actionEnable
          }
        }) ?? []
    )
  })

  return {
    version,
    launchRedirect,
    setLaunchRedirect,
    redirectToLaunchRedirect,
    getIndexTabs,
    indexTabConfig,
    tabs,
    currentTab,
    loadedTab,
    toggleTab
  }
})

export default useGlobalStore
