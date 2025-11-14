import { defineStore } from 'pinia'
import { readonly, ref, shallowRef } from 'vue'
import { type QuickMenuItem } from '../hooks/useQuickMenu'
import Taro, { useRouter } from '@tarojs/taro'

export type GlobalShareHandler = Parameters<typeof Taro.useShareAppMessage>[0]

/** 全局设置 */
const useCoreStore = defineStore('core', () => {
  const pagesMap = ref<
    {
      id: string
      path: string
      ts: string | number
    }[]
  >([])

  const getPageId = (router?: Taro.RouterInfo) => {
    router = router ?? useRouter()
    const path = (router as any).$taroPath
    const ts = router.params.$taroTimestamp!
    return pagesMap.value.find(item => {
      return item.path === path && item.ts === ts
    })?.id
  }

  /** 设置页面映射 */
  const setPageMap = (id: string, router?: Taro.RouterInfo) => {
    router = router ?? useRouter()
    const path = (router as any).$taroPath
    const ts = router.params.$taroTimestamp!
    removePage(router)
    pagesMap.value.push({
      id,
      path,
      ts
    })
  }

  /** 移除页面映射 */
  const removePage = (router: Taro.RouterInfo) => {
    const path = (router as any).$taroPath
    const ts = router.params.$taroTimestamp!
    const index = pagesMap.value.findIndex(item => {
      return item.path === path && item.ts === ts
    })
    if (index !== -1) {
      pagesMap.value.splice(index, 1)
    }
  }

  /** 快捷导航功能按钮列表 */
  const menuList = ref<QuickMenuItem[]>([])
  /** 设置快捷导航默认功能项 */
  const setQuickMenuList = (list: QuickMenuItem[]) => {
    menuList.value = list
  }

  /** 全局默认分享回调 */
  const globalShareHandler = shallowRef<GlobalShareHandler | null>(null)
  /** 设置全局默认分享回调 */
  const setGlobalShareHandler = (handler: GlobalShareHandler) => {
    globalShareHandler.value = handler
  }

  /** 禁用分享页面id列表 */
  const disabledSharePages = ref<string[]>([])
  /** 设置禁用分享页面，可传入第二个参数 false 取消限制 */
  const setDisabledSharePage = (id: string, disabled?: boolean) => {
    const _disabled = disabled ?? true
    const index = disabledSharePages.value.indexOf(id)
    if (_disabled) {
      index === -1 && disabledSharePages.value.push(id)
    } else {
      index !== -1 && disabledSharePages.value.splice(index, 1)
    }
  }

  return {
    menuList: readonly(menuList),
    setQuickMenuList,
    globalShareHandler: readonly(globalShareHandler),
    setGlobalShareHandler,
    disabledSharePages,
    setDisabledSharePage,
    pagesMap,
    getPageId,
    setPageMap,
    removePage
  }
})

export default useCoreStore
