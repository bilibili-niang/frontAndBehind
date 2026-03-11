import { computed } from 'vue'
import usePermissionStore from '../stores/permission'
import type { MenuTreeNode } from '../stores/permission'

/**
 * 路由菜单项
 */
export interface RouteMenuItem {
  key: string
  name: string
  path: string
  component?: string
  icon?: string
  title: string
  hidden?: boolean
  keepAlive?: boolean
  children?: RouteMenuItem[]
  meta?: {
    title?: string
    icon?: string
    hiddenInMenu?: boolean
    hiddenInTab?: boolean
    keepAlive?: boolean
    permission?: string
  }
}

/**
 * 权限菜单组合式函数
 * 根据用户权限生成菜单
 */
export function usePermissionMenu() {
  const permissionStore = usePermissionStore()

  /**
   * 是否有权限菜单
   */
  const hasMenus = computed(() => {
    return permissionStore.menus.length > 0
  })

  /**
   * 权限菜单列表
   */
  const permissionMenus = computed(() => {
    return permissionStore.menus
  })

  /**
   * 将菜单树转换为路由格式
   * @param menus 菜单树
   * @returns 路由菜单列表
   */
  const convertToRouteMenus = (menus: MenuTreeNode[]): RouteMenuItem[] => {
    return menus.map(menu => ({
      key: menu.id,
      name: menu.name,
      path: menu.path,
      component: menu.component,
      icon: menu.icon,
      title: menu.name,
      hidden: menu.hidden,
      keepAlive: menu.keepAlive,
      children: menu.children.length > 0 ? convertToRouteMenus(menu.children) : undefined,
      meta: {
        title: menu.name,
        icon: menu.icon,
        hiddenInMenu: menu.hidden,
        keepAlive: menu.keepAlive,
        permission: menu.permission
      }
    }))
  }

  /**
   * 路由格式的菜单列表
   */
  const routeMenus = computed<RouteMenuItem[]>(() => {
    return convertToRouteMenus(permissionStore.menus)
  })

  /**
   * 侧边栏菜单（过滤隐藏的）
   */
  const sideMenus = computed<RouteMenuItem[]>(() => {
    return routeMenus.value.filter(menu => !menu.hidden)
  })

  /**
   * 根据路径查找菜单
   * @param path 路径
   * @returns 菜单项或 undefined
   */
  const findMenuByPath = (path: string): RouteMenuItem | undefined => {
    const findInMenus = (menus: RouteMenuItem[]): RouteMenuItem | undefined => {
      for (const menu of menus) {
        if (menu.path === path) {
          return menu
        }
        if (menu.children) {
          const found = findInMenus(menu.children)
          if (found) return found
        }
      }
      return undefined
    }
    return findInMenus(routeMenus.value)
  }

  /**
   * 检查是否有菜单权限
   * @param path 路径
   * @returns 是否有权限
   */
  const hasMenuPermission = (path: string): boolean => {
    return permissionStore.hasMenuPermission(path)
  }

  return {
    hasMenus,
    permissionMenus,
    routeMenus,
    sideMenus,
    findMenuByPath,
    hasMenuPermission
  }
}

export default usePermissionMenu
