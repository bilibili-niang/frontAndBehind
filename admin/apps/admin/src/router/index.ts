import MainLayout from '@/layouts/MainLayout'
import { generatedChildrenRoutes } from './auto'
import { registerRoutes, router } from '@pkg/core'
// 移除登录判断拦截

const defaultRoutePath = '/welcome'

// 过滤出测试页面路由
const testRoute = generatedChildrenRoutes.find(route => route.path === '/test')
const otherRoutes = generatedChildrenRoutes.filter(route => route.path !== '/test')

// 将 admin 的根路由注册到 @pkg/core 的 router 实例上
router.addRoute({
  path: '/',
  name: 'root',
  component: MainLayout,
  redirect: defaultRoutePath,
  children: otherRoutes
})

// 为测试页面添加独立路由，不使用 MainLayout
if (testRoute) {
  router.addRoute({
    path: '/test',
    name: 'test',
    component: testRoute.component,
    meta: {
      ...testRoute.meta,
      purePage: true,
      hideInMenu: true,
      hideInProd: true
    }
  })
}

// 同步注册到核心路由存储（期望一个路由数组），供基础布局与侧边菜单解析
registerRoutes([
  {
    path: '/',
    name: 'index',
    component: MainLayout as any,
    children: otherRoutes
  } as any
])

console.log('routes', router)

// 路由守卫：当前不启用登录拦截，所有路由直接放行
// router.beforeEach((_to, _from, next) => next())
export default router

export * from './jump'
