import { decorationNew } from '@pkg/decoration'
import type { RouteMeta } from '@/router/routeMeta'
import { ROUTE_META_PURE } from '@pkg/core'

export default decorationNew

export const routeMeta: RouteMeta = {
  title: '新建装修页面',
  hideInMenu: true,
  // 是否隐藏侧边菜单
  [ROUTE_META_PURE]: true,
  order: 1000
}
