import { decorationNew } from '@anteng/decoration'
// import { CommonDeckPage } from '@anteng/decoration'
import type { RouteMeta } from '@/router/routeMeta'
import { ROUTE_META_PURE } from '@anteng/core'

export default decorationNew
// export default CommonDeckPage

export const routeMeta: RouteMeta = {
  title: '新建装修页面',
  hideInMenu: true,
  // 是否隐藏侧边菜单
  [ROUTE_META_PURE]: true,
  order: 1000
}
