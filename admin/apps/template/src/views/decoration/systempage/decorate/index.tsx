import { systemPageDecorate } from '@anteng/decoration'
import type { RouteMeta } from '@/router/routeMeta'
import { ROUTE_META_PURE } from '@anteng/core'

export default systemPageDecorate

export const routeMeta: RouteMeta = {
  title: '系统页面装修',
  hideInMenu: true,
  // 纯界面模式：进入装修页时隐藏布局与菜单
  [ROUTE_META_PURE]: true,
  order: 1001
}