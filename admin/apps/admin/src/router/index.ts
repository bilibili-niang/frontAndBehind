import MainLayout from '@/layouts/MainLayout'
import { generatedChildrenRoutes } from './auto'
import { registerRoutes, router } from '@anteng/core'
import { resumeRoutes } from '@anteng/resume'
// 移除登录判断拦截

const defaultRoutePath = '/resume/home'

const children = [...generatedChildrenRoutes, ...resumeRoutes]
// 将 admin 的根路由注册到 @anteng/core 的 router 实例上
router.addRoute({
  path: '/',
  name: 'root',
  component: MainLayout,
  redirect: defaultRoutePath,
  children
})
// 同步注册到核心路由存储（期望一个路由数组），供基础布局与侧边菜单解析
registerRoutes([
  {
    path: '/',
    name: 'index',
    component: MainLayout as any,
    children
  } as any
])

console.log('routes', router)

// 路由守卫：当前不启用登录拦截，所有路由直接放行
router.beforeEach((_to, _from, next) => next())
export default router

export * from './jump'
