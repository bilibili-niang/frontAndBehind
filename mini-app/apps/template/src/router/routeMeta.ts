export interface RouteMeta {
  /** 页面标题，用于导航与标签显示 */
  title: string
  /** 是否需要登录权限 */
  requiresAuth?: boolean
  /** 是否在菜单中隐藏 */
  hideInMenu?: boolean
  /** 菜单或路由的排序权重（越小越靠前） */
  order?: number
  /** 图标名称或路径（按项目约定） */
  icon?: string
  /** 是否缓存页面组件（基于 KeepAlive） */
  keepAlive?: boolean
  /** 纯界面模式：用于控制布局元素的显示/隐藏 */
  pureInterface?: boolean
  /** 可选的路由重定向，留空字符串时默认跳至该目录首个子路由 */
  redirect?: string
}

// 可选的辅助函数，提供类型提示与常量导出
export const defineRouteMeta = (meta: RouteMeta) => meta