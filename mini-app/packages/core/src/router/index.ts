import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import BasicLayout, { BasicLayoutException } from '../components/layouts/basic-layout'
import PageView from '../components/layouts/page-view'
import Exception404 from '../views/exception/404'
import useBasicLayoutStore from '../stores/basic-layout'
import useUserStore from '../stores/user'
import blank from '../views/exception/blank'
import { last } from 'lodash'
import { AppProgress } from '../components/baseApp'

export { BasicLayout, PageView, Exception404 }

export type IRoute = RouteRecordRaw & {
  meta?: {
    /** 标题 */
    title?: string
    /** 图标 */
    icon?: string
    /** 在菜单栏隐藏 */
    hiddenInMenu?: boolean
    /** 在标签页隐藏 */
    hiddenInTab?: boolean
    /** 开启状态缓存 */
    keepAlive?: boolean

    /** 展示面包屑，仅 BasicLayout 有效 */
    showBreadcrumb?: boolean
    /** 展示标签页，仅 BasicLayout 有效 */
    showLabelTab?: boolean
  }
}
const router = createRouter({
  // 使用 Vite 注入的 BASE_URL 作为路由 base，确保与构建/开发的前缀一致
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      meta: { title: 'login', hiddenInTab: true, hiddenInMenu: true },
      component: () => import('../views/login')
    },
    {
      path: '/404',
      name: '404',
      meta: { title: '404', hiddenInTab: true, hiddenInMenu: true },
      component: Exception404
    },
    {
      path: '/blank',
      name: 'blank',
      meta: {
        title: '',
        hiddenInTab: true,
        hiddenInMenu: true
      },
      component: blank
    },
    {
      path: '/:pathMatch(.*)*',
      component: BasicLayoutException
    }
  ]
})

router.beforeEach((to, from, next) => {
  next()
  AppProgress.start()
})

router.afterEach((to, from, failure) => {
  AppProgress.done()
  const basicLayoutStore = useBasicLayoutStore()
  if (to.meta?.hiddenInTab !== true) {
    basicLayoutStore.addPageTab({
      key: to.name as string,
      label: (to.meta?.title ?? to.name) as string,
      path: to.path
    })
  }
  basicLayoutStore.toggleTab(to.name as string)

  window.parent?.postMessage?.(
    {
      url: window.location.href,
      route: last(to.matched)?.path,
      path: to.path,
      anteng: true
    },
    '*'
  )
})

export default router

/** 路由初始化完成 */
router.isReady().then(() => {
  useUserStore()
})

export const defineRoute = (route: IRoute) => route
;(window as any).__router__ = router

/** 注册路由 */
export const registerRoutes = (routes: IRoute[]) => {
  // 这里防止 pinia尚未挂载导致出错。
  setTimeout(() => {
    console.log('注册路由', routes)
    useBasicLayoutStore().registerRoutes(routes)
    console.log('注册路由ok')
  })
}
