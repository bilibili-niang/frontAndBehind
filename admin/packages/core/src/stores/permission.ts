import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

/**
 * 菜单树节点
 */
export interface MenuTreeNode {
  id: string
  name: string
  path: string
  component: string
  icon: string
  permission: string
  sort: number
  hidden: boolean
  keepAlive: boolean
  children: MenuTreeNode[]
}

/**
 * 用户权限信息
 */
export interface UserPermissionInfo {
  roles: string[]
  permissions: string[]
  menus: MenuTreeNode[]
}

/**
 * 权限 Store
 * 管理用户权限、角色、菜单
 */
const usePermissionStore = defineStore('PERMISSION', () => {
  // State
  const roles = ref<string[]>([])
  const permissions = ref<string[]>([])
  const menus = ref<MenuTreeNode[]>([])

  // Getters
  /**
   * 是否已加载权限
   */
  const isLoaded = computed(() => {
    return permissions.value.length > 0 || roles.value.length > 0
  })

  /**
   * 是否为管理员
   */
  const isAdmin = computed(() => {
    return roles.value.includes('admin')
  })

  /**
   * 获取扁平化的菜单列表
   */
  const flatMenus = computed(() => {
    const result: MenuTreeNode[] = []
    const flatten = (items: MenuTreeNode[]) => {
      items.forEach(item => {
        result.push(item)
        if (item.children && item.children.length > 0) {
          flatten(item.children)
        }
      })
    }
    flatten(menus.value)
    return result
  })

  /**
   * 获取权限路由
   */
  const permissionRoutes = computed(() => {
    return flatMenus.value.filter(menu => menu.path && !menu.hidden)
  })

  // Actions
  /**
   * 设置权限信息
   * @param data 权限信息
   */
  const setPermissions = (data: UserPermissionInfo) => {
    roles.value = data.roles || []
    permissions.value = data.permissions || []
    menus.value = data.menus || []
  }

  /**
   * 检查是否有指定权限
   * @param permission 权限标识
   * @returns 是否有权限
   */
  const hasPermission = (permission: string | string[]): boolean => {
    // 管理员拥有所有权限
    if (isAdmin.value) return true

    const perms = Array.isArray(permission) ? permission : [permission]
    return perms.some(p => permissions.value.includes(p))
  }

  /**
   * 检查是否有指定角色
   * @param role 角色名称
   * @returns 是否有角色
   */
  const hasRole = (role: string | string[]): boolean => {
    const rolesList = Array.isArray(role) ? role : [role]
    return rolesList.some(r => roles.value.includes(r))
  }

  /**
   * 检查是否有菜单权限
   * @param path 菜单路径
   * @returns 是否有权限
   */
  const hasMenuPermission = (path: string): boolean => {
    // 管理员拥有所有权限
    if (isAdmin.value) return true

    // 检查是否在权限路由中
    return permissionRoutes.value.some(route => route.path === path)
  }

  /**
   * 清除权限信息
   */
  const clearPermissions = () => {
    roles.value = []
    permissions.value = []
    menus.value = []
  }

  /**
   * 添加权限
   * @param permission 权限标识
   */
  const addPermission = (permission: string) => {
    if (!permissions.value.includes(permission)) {
      permissions.value.push(permission)
    }
  }

  /**
   * 移除权限
   * @param permission 权限标识
   */
  const removePermission = (permission: string) => {
    const index = permissions.value.indexOf(permission)
    if (index > -1) {
      permissions.value.splice(index, 1)
    }
  }

  /**
   * 添加角色
   * @param role 角色名称
   */
  const addRole = (role: string) => {
    if (!roles.value.includes(role)) {
      roles.value.push(role)
    }
  }

  /**
   * 移除角色
   * @param role 角色名称
   */
  const removeRole = (role: string) => {
    const index = roles.value.indexOf(role)
    if (index > -1) {
      roles.value.splice(index, 1)
    }
  }

  return {
    // State
    roles,
    permissions,
    menus,
    // Getters
    isLoaded,
    isAdmin,
    flatMenus,
    permissionRoutes,
    // Actions
    setPermissions,
    hasPermission,
    hasRole,
    hasMenuPermission,
    clearPermissions,
    addPermission,
    removePermission,
    addRole,
    removeRole
  }
})

/**
 * 权限检查辅助函数
 * @param permission 权限标识
 * @returns 是否有权限
 */
export const withPermission = (permission: string | string[]): boolean => {
  const permissionStore = usePermissionStore()
  return permissionStore.hasPermission(permission)
}

/**
 * 角色检查辅助函数
 * @param role 角色名称
 * @returns 是否有角色
 */
export const withRole = (role: string | string[]): boolean => {
  const permissionStore = usePermissionStore()
  return permissionStore.hasRole(role)
}

export default usePermissionStore
