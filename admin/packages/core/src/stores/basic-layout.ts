import { getHeaderMenus, getSideMenus } from '../api/menu'
import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import router, { BasicLayout, Exception404, type IRoute } from '../router'
import { message } from '@pkg/ui'
import urlParse from 'url-parse'
import usePermissionStore from './permission'

export type PageTab = {
  key: string
  label: string
  path: string
  icon?: string
}

export interface IHeaderMenuNode {
  customId?: string
  customName?: string
  customSource?: string
  children?: IHeaderMenuNode[]
  hasChildren?: boolean
  id?: string
  key?: string
  parentId?: string
  sort?: number
  source?: string
  title?: string
  value?: string

  [property: string]: any
}

/** 扁平化路由表 */
const flattenRegisteredRoutes = (routes: any[]) => {
  const result: any[] = []
  routes.forEach((route) => {
    if (Array.isArray(route.children)) {
      result.push(route, ...flattenRegisteredRoutes(route.children))
    } else {
      result.push(route)
    }
  })

  return result
}

// TODO 要考虑应用内可能存在多个 basic-layout ，可以改成根据 key 创建 store
const useBasicLayoutStore = defineStore('basic-layout', () => {
  const registeredRoutes = shallowRef<IRoute[]>([])
  const registerRoutes = (routes: IRoute[]) => {
    registeredRoutes.value = routes
  }

  const flatRegisteredRoutes = computed(() => {
    return flattenRegisteredRoutes(registeredRoutes.value)
  })

  /** 路由加载中，此时不应该显示404页面，应该(在404组件内)显示页面加载中的提示 */
  const isRoutesLoading = ref(true)
  const isRoutesError = ref(false)
  const headerMenus = ref<IHeaderMenuNode[]>([])
  const flattenHeaderMenus = computed(() => {
    const menus: IHeaderMenuNode[] = []
    const loop = (node: IHeaderMenuNode) => {
      menus.push(node)
      node.children?.forEach(loop)
    }
    headerMenus.value.forEach(loop)
    return menus
  })
  const currentHeaderMenuId = ref('')
  const currentHeaderMenu = computed(() => {
    const list = flattenRegisteredRoutes(headerMenus.value as any) as IHeaderMenuNode[]
    return list.find((item) => item.id === currentHeaderMenuId.value)
  })

  /** 侧边菜单栏 */
  const sideMenus = shallowRef<IRoute[]>([])

  interface Flattenable {
    children?: Flattenable[]
  }
  function flatten<T extends Flattenable>(obj: T, result: T[] = []) {
    if (Array.isArray(obj.children)) {
      for (const child of obj.children) {
        flatten(child, result)
      }
    }
    result.push(obj)
    return result
  }

  const flatenSideMenus = computed(() => {
    const list: typeof sideMenus.value = []
    sideMenus.value.forEach((item) => flatten(item, list))
    return list
  })
  /** 侧边菜单栏错误 */
  const sideMenuError = ref(false)
  /** 生成侧边菜单栏 */
  const generateSideMenus = (topMenuId: string) => {
    isRoutesLoading.value = true
    const closeLoading = message.loading({ content: '菜单切换中...', duration: 0 })
    getSideMenus(topMenuId)
      .then((res) => {
        usePermissionStore().generatePermission(res.data)

        const menus = res.data.map(retrieveSideMenus)
        sideMenus.value = menus

        const routes = router.getRoutes()

        // 切换应用时? 这里移除此前注册的异步路由。
        routes.forEach((item) => {
          if (item.meta?.isAsyncRoute) {
            router.removeRoute(item.name!)
          }
        })

        const index = flatRegisteredRoutes.value.find((item) => item.name === 'index') ?? {
          path: '/',
          name: 'index',
          component: BasicLayout,
          children: [...menus],
          meta: {
            isAsyncRoute: true
          }
        }

        // console.log(registeredRoutes.value, flatRegisteredRoutes.value)
        router.addRoute(index)
        // console.log(router.currentRoute)
        // console.log(router.getRoutes())
        router.replace(router.currentRoute.value.fullPath)
      })
      .catch((err) => {
        console.log('菜单恢复失败：', err)
      })
      .finally(() => {
        closeLoading()
        // 防止页面路由重载之前更新视图会有404页面闪现
        setTimeout(() => {
          isRoutesLoading.value = false
        }, 300)
      })
  }

  // 恢复侧边菜单数据，(优先使用接口数据定义的内容)
  const retrieveSideMenus = (menuNode: any) => {
    const code = menuNode.code
    const path = menuNode.path
    const rawRouteRecord = flatRegisteredRoutes.value.find((item) => item.name === code || item.path === path)
    return {
      id: menuNode.id,
      parentId: menuNode.parentId,
      code: code,
      path: path,
      redirect: menuNode.redirect,
      component: rawRouteRecord?.component ?? Exception404,
      children: (menuNode.children ?? []).filter((child) => child.category == 1).map(retrieveSideMenus),
      meta: {
        ...rawRouteRecord?.meta,
        title: menuNode.customName || menuNode.name,
        icon: menuNode.customSource || menuNode.source || rawRouteRecord?.meta?.icon,
        hiddenInMenu: rawRouteRecord?.meta?.hiddenInMenu ?? menuNode.hidden ?? false,
        /** 是异步路由，用于移除路由时判断 */
        isAsyncRoute: true
      }
    }
  }

  const toggleMenu = (id: string) => {
    if (currentHeaderMenuId.value === id) {
      message.info({ content: '当前已在该应用内' })
      return void 0
    }
    // message.info('切换菜单')
    // currentHeaderMenuId.value = id
    // generateSideMenus(id)
    // sideMenus.value = []
    const target = flattenHeaderMenus.value.find((item) => item.id === id)
    if (target && target.value) {
      window.open(`/${target.value}`)
    } else {
      message.error('路由错误')
    }
  }

  const pageTabs = ref<PageTab[]>([])
  const currentTab = ref<string | undefined>(undefined)
  const addPageTab = (tab: PageTab) => {
    if (!pageTabs.value.find((item) => item.key === tab.key)) {
      pageTabs.value.push(tab)
    } else {
      // 已经存在了
    }
  }
  const removePageTab = (key: string) => {
    const index = pageTabs.value.findIndex((item) => item.key === key)
    if (index !== -1) {
      pageTabs.value.splice(index, 1)
    }
  }

  const toggleTab = (key: string) => {
    currentTab.value = key
  }

  const logo = ref<any>(null)
  const setConfig = (config: any) => {
    logo.value = config.logo
    Object.assign(basicLayoutProps.value, config)
  }

  const basicLayoutProps = ref({
    logo: null,
    customButtons: () => null
  })

  const link = urlParse(window.location.href, true)

  const pageOnly = ref(link.query?.pageOnly === 'true')

  return {
    pageTabs,
    currentTab,
    addPageTab,
    removePageTab,
    toggleTab,
    logo,
    setConfig,
    sideMenus,
    flatenSideMenus,
    registeredRoutes,
    registerRoutes,
    isRoutesLoading,
    isRoutesError,
    headerMenus,
    currentHeaderMenuId,
    currentHeaderMenu,
    toggleMenu,
    pageOnly,
    basicLayoutProps
  }
})

export default useBasicLayoutStore
