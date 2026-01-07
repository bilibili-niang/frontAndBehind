import { systemList } from '@pkg/decoration'
import type { RouteMeta } from '@/router/routeMeta'
import { ROUTE_META_PURE } from '@pkg/core'

export default systemList

export const routeMeta: RouteMeta = {
  title: '系统页面',
  hideInMenu: false,
  keepAlive: true,
  // 是否隐藏侧边菜单
  [ROUTE_META_PURE]: false,
  order: 1
}
