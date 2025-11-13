import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { openLoginModal } from '@/composables/authFlow'

const routes: any[] = [
  {
    path: '/',
    name: 'index',
    meta: {
      showBreadcrumb: true
    },
    redirect: '/home',
    children: [
      {
        path: '/home',
        meta: {
          title: '首页'
        },
        name: 'home',
        component: () => import('@/views/home/index'),
      },
      {
        path: '/tool',
        meta: {
          title: '工具',
          requiresAuth: true
        },
        name: 'tool',
        component: () => import('@/views/tool/index')
      }
    ]
  }
]
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫：需要登录的路由在未登录时弹出登录框
router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  if (to.meta?.requiresAuth && !auth.isLogin) {
    openLoginModal()
    return next(false)
  }
  next()
})
export default router
