import type { RouteMeta } from '@/router/routeMeta'

export const routeMeta: RouteMeta = {
  title: '模板',
  // 留空字符串表示自动跳转到本目录排序最靠前的子路由
  redirect: '',
  // 正式环境打包不展示
  hideInProd: true,
  // 是否隐藏侧边菜单
  icon: 'platte',
  hideInMenu: true
}
