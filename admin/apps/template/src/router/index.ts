import { type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import MainLayout from '@/layouts/MainLayout'
import { generatedChildrenRoutes } from './auto'
import { router, registerRoutes } from '@anteng/core'

const homeRoute = generatedChildrenRoutes.find(r => r.path === '/home')
const defaultRoutePath = homeRoute?.path || (generatedChildrenRoutes[0]?.path ?? '/home')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'root',
    component: MainLayout,
    redirect: defaultRoutePath,
    children: generatedChildrenRoutes
  }
]

// 将 admin 的根路由注册到 @anteng/core 的 router 实例上
router.addRoute(routes[0])
// 同步注册到核心路由存储，供基础布局与侧边菜单解析
registerRoutes(routes as any)

// 路由守卫：当前不启用登录拦截，所有路由直接放行
router.beforeEach((to, _from, next) => {
  next()
})
export default router

export * from './jump'