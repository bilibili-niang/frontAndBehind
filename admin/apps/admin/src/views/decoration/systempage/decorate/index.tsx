import { systemPageDecorate } from '@pkg/decoration'
import type { RouteMeta } from '@/router/routeMeta'
import { ROUTE_META_PURE } from '@pkg/core'

export default systemPageDecorate

export const routeMeta: RouteMeta = {
  title: '系统页面装修',
  hideInMenu: true,
  // 纯界面模式：进入装修页时隐藏布局与菜单
  [ROUTE_META_PURE]: true,
  order: 1001
}