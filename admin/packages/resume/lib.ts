import { RouterView } from 'vue-router'
import { ROUTE_META_PURE, type IRoute } from '@anteng/core'

export const resumeRoutes: IRoute[] = [
  {
    path: '/resume',
    name: 'resume',
    component: RouterView,
    redirect: '/resume/home',
    meta: {
      title: '简历',
      icon: 'box'
    },
    children: [
      {
        path: '/resume/home',
        name: 'resume-home',
        meta: {
          title: '简历首页',
          purePage: true,
          order: 2,
          keepAlive: true
        },
        component: () => import('./src/views/resume/home')
      },
      {
        path: '/resume/list',
        name: 'resume-list',
        meta: {
          title: '简历列表',
          order: 1
        },
        component: () => import('./src/views/resume/list')
      },
      {
        path: '/resume/create',
        name: 'resume-create',
        meta: {
          title: '新建简历',
          hideInMenu: true,
          [ROUTE_META_PURE]: true,
          order: 2
        },
        component: () => import('./src/views/resume/create')
      }
    ]
  }
]

export { default as useResumeStore } from './src/stores/resume'