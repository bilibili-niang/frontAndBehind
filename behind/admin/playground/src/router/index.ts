import { createRouter, createWebHashHistory } from 'vue-router'
import routes from '~pages'
import { useAuthStore } from '@/store/auth'
import { openLoginModal } from '@/composables/authFlow'
import type { RouteRecordRaw } from 'vue-router'

// 添加根路由
const rootRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'index',
    meta: { showBreadcrumb: true },
    redirect: '/home',
    children: routes as RouteRecordRaw[]
  }
]
const router = createRouter({
  history: createWebHashHistory(),
  routes: rootRoutes
})

// 路由守卫：需要登录的路由在未登录时弹出登录框
router.beforeEach((to: any, _from: any, next: any) => {
  const auth = useAuthStore()
  if (to.meta?.requiresAuth && !auth.isLogin) {
    openLoginModal()
    return next(false)
  }
  next()
})
export default router
