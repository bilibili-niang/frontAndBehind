import { roleRepository } from '@/repository/RoleRepository'
import { permissionRepository } from '@/repository/PermissionRepository'
import { rolePermissionRepository } from '@/repository/RolePermissionRepository'
import { userRoleRepository } from '@/repository/UserRoleRepository'
import { menuRepository } from '@/repository/MenuRepository'
import Role from '@/schema/role'
import Permission from '@/schema/permission'
import Menu from '@/schema/menu'
import { debug, error } from '@/config/log4j'

/**
 * 用户权限信息
 */
export interface UserPermissionInfo {
  roles: string[]
  permissions: string[]
  menus: MenuTreeNode[]
}

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
 * 创建角色数据
 */
export interface CreateRoleData {
  name: string
  displayName: string
  description?: string
  status?: number
  isDefault?: boolean
  dataScope?: number
  permissionIds?: string[]
}

/**
 * 更新角色数据
 */
export interface UpdateRoleData {
  displayName?: string
  description?: string
  status?: number
  isDefault?: boolean
  dataScope?: number
  permissionIds?: string[]
}

/**
 * 创建权限数据
 */
export interface CreatePermissionData {
  name: string
  displayName: string
  type: string
  resource: string
  action: string
  parentId?: string
  sort?: number
  status?: number
}

/**
 * 创建菜单数据
 */
export interface CreateMenuData {
  name: string
  path?: string
  component?: string
  icon?: string
  permission?: string
  parentId?: string
  sort?: number
  hidden?: boolean
  keepAlive?: boolean
  status?: number
}

/**
 * 权限服务
 * 负责权限相关的业务逻辑
 */
export class PermissionService {
  /**
   * 获取用户权限信息
   * @param userId 用户ID
   * @returns 用户权限信息
   */
  async getUserPermissions(userId: string): Promise<UserPermissionInfo> {
    debug(`获取用户权限信息: ${userId}`)

    // 1. 获取用户角色
    const userRoles = await userRoleRepository.findByUserId(userId)
    const roleIds = userRoles.map(ur => ur.roleId)

    // 2. 获取角色详情
    const roles: Role[] = []
    for (const roleId of roleIds) {
      const role = await roleRepository.findById(roleId)
      if (role) {
        roles.push(role)
      }
    }

    // 3. 获取角色权限
    const rolePermissions = await rolePermissionRepository.findByRoleIds(roleIds)
    const permissionIds = [...new Set(rolePermissions.map(rp => rp.permissionId))]

    // 4. 获取权限详情
    const permissions = await permissionRepository.findByIds(permissionIds)
    const permissionNames = permissions.map(p => p.name)

    // 5. 获取用户菜单
    const menus = await this.getUserMenus(permissionNames)

    return {
      roles: roles.map(r => r.name),
      permissions: permissionNames,
      menus
    }
  }

  /**
   * 获取用户菜单树
   * @param permissionNames 权限标识列表
   * @returns 菜单树
   */
  async getUserMenus(permissionNames: string[]): Promise<MenuTreeNode[]> {
    debug(`获取用户菜单: ${permissionNames.join(', ')}`)

    // 获取有权限的菜单
    const menus = await menuRepository.findByPermissions(permissionNames)

    // 构建菜单树
    return this.buildMenuTree(menus)
  }

  /**
   * 构建菜单树
   * @param menus 菜单列表
   * @param parentId 父菜单ID
   * @returns 菜单树节点列表
   */
  private buildMenuTree(menus: Menu[], parentId: string | null = null): MenuTreeNode[] {
    const result: MenuTreeNode[] = []

    for (const menu of menus) {
      if (menu.parentId === parentId) {
        const children = this.buildMenuTree(menus, menu.id)
        result.push({
          id: menu.id,
          name: menu.name,
          path: menu.path || '',
          component: menu.component || '',
          icon: menu.icon || '',
          permission: menu.permission || '',
          sort: menu.sort,
          hidden: menu.hidden,
          keepAlive: menu.keepAlive,
          children
        })
      }
    }

    // 按排序值排序
    return result.sort((a, b) => a.sort - b.sort)
  }

  /**
   * 检查用户是否有指定权限
   * @param userId 用户ID
   * @param permission 权限标识
   * @returns 是否有权限
   */
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId)
    return userPermissions.permissions.includes(permission)
  }

  /**
   * 检查用户是否有指定角色
   * @param userId 用户ID
   * @param role 角色名称
   * @returns 是否有角色
   */
  async hasRole(userId: string, role: string): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId)
    return userPermissions.roles.includes(role)
  }

  /**
   * 创建角色
   * @param data 角色数据
   * @returns 创建的角色
   */
  async createRole(data: CreateRoleData): Promise<Role> {
    debug(`创建角色: ${data.name}`)

    // 检查角色名是否已存在
    const existingRole = await roleRepository.findByName(data.name)
    if (existingRole) {
      throw new Error(`角色 ${data.name} 已存在`)
    }

    // 创建角色
    const role = await roleRepository.create({
      name: data.name,
      displayName: data.displayName,
      description: data.description || '',
      status: data.status ?? 1,
      isDefault: data.isDefault ?? false,
      dataScope: data.dataScope ?? 1
    })

    // 关联权限
    if (data.permissionIds && data.permissionIds.length > 0) {
      await rolePermissionRepository.batchCreate(role.id, data.permissionIds)
    }

    return role
  }

  /**
   * 更新角色
   * @param roleId 角色ID
   * @param data 更新数据
   * @returns 更新后的角色
   */
  async updateRole(roleId: string, data: UpdateRoleData): Promise<Role | null> {
    debug(`更新角色: ${roleId}`)

    // 更新角色信息
    const updateData: any = {}
    if (data.displayName !== undefined) updateData.displayName = data.displayName
    if (data.description !== undefined) updateData.description = data.description
    if (data.status !== undefined) updateData.status = data.status
    if (data.isDefault !== undefined) updateData.isDefault = data.isDefault
    if (data.dataScope !== undefined) updateData.dataScope = data.dataScope

    await roleRepository.update(roleId, updateData)

    // 更新权限关联
    if (data.permissionIds !== undefined) {
      await rolePermissionRepository.deleteByRoleId(roleId)
      if (data.permissionIds.length > 0) {
        await rolePermissionRepository.batchCreate(roleId, data.permissionIds)
      }
    }

    return await roleRepository.findById(roleId)
  }

  /**
   * 删除角色
   * @param roleId 角色ID
   * @returns 是否删除成功
   */
  async deleteRole(roleId: string): Promise<boolean> {
    debug(`删除角色: ${roleId}`)

    // 删除角色权限关联
    await rolePermissionRepository.deleteByRoleId(roleId)

    // 删除角色
    const deleted = await roleRepository.deleteById(roleId)
    return deleted > 0
  }

  /**
   * 创建权限
   * @param data 权限数据
   * @returns 创建的权限
   */
  async createPermission(data: CreatePermissionData): Promise<Permission> {
    debug(`创建权限: ${data.name}`)

    // 检查权限名是否已存在
    const existingPermission = await permissionRepository.findByName(data.name)
    if (existingPermission) {
      throw new Error(`权限 ${data.name} 已存在`)
    }

    return await permissionRepository.create({
      name: data.name,
      displayName: data.displayName,
      type: data.type,
      resource: data.resource,
      action: data.action,
      parentId: data.parentId || '',
      sort: data.sort ?? 0,
      status: data.status ?? 1
    })
  }

  /**
   * 创建菜单
   * @param data 菜单数据
   * @returns 创建的菜单
   */
  async createMenu(data: CreateMenuData): Promise<Menu> {
    debug(`创建菜单: ${data.name}`)

    return await menuRepository.create({
      name: data.name,
      path: data.path || '',
      component: data.component || '',
      icon: data.icon || '',
      permission: data.permission || '',
      parentId: data.parentId || '',
      sort: data.sort ?? 0,
      hidden: data.hidden ?? false,
      keepAlive: data.keepAlive ?? false,
      status: data.status ?? 1
    })
  }

  /**
   * 为用户分配角色
   * @param userId 用户ID
   * @param roleIds 角色ID列表
   */
  async assignRolesToUser(userId: string, roleIds: string[]): Promise<void> {
    debug(`为用户分配角色: ${userId}, ${roleIds.join(', ')}`)

    // 删除现有角色关联
    await userRoleRepository.deleteByUserId(userId)

    // 创建新关联
    if (roleIds.length > 0) {
      await userRoleRepository.batchCreate(userId, roleIds)
    }
  }

  /**
   * 获取用户的角色
   * @param userId 用户ID
   * @returns 角色列表
   */
  async getUserRoles(userId: string): Promise<Role[]> {
    const userRoles = await userRoleRepository.findByUserId(userId)
    const roleIds = userRoles.map(ur => ur.roleId)
    if (roleIds.length === 0) return []
    return await roleRepository.findByIds(roleIds)
  }

  /**
   * 为角色分配权限
   * @param roleId 角色ID
   * @param permissionIds 权限ID列表
   */
  async assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<void> {
    debug(`为角色分配权限: ${roleId}, ${permissionIds.join(', ')}`)

    // 删除现有权限关联
    await rolePermissionRepository.deleteByRoleId(roleId)

    // 创建新关联
    if (permissionIds.length > 0) {
      await rolePermissionRepository.batchCreate(roleId, permissionIds)
    }
  }

  /**
   * 获取角色的权限
   * @param roleId 角色ID
   * @returns 权限列表
   */
  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const rolePermissions = await rolePermissionRepository.findByRoleId(roleId)
    const permissionIds = [...new Set(rolePermissions.map(rp => rp.permissionId))]
    if (permissionIds.length === 0) return []
    return await permissionRepository.findByIds(permissionIds)
  }

  /**
   * 获取所有角色
   * @returns 角色列表
   */
  async getAllRoles(): Promise<Role[]> {
    return await roleRepository.findByCriteria({ status: 1 })
  }

  /**
   * 获取所有权限
   * @returns 权限列表
   */
  async getAllPermissions(): Promise<Permission[]> {
    return await permissionRepository.findByCriteria({ status: 1 })
  }

  /**
   * 获取所有菜单
   * @returns 菜单列表
   */
  async getAllMenus(): Promise<Menu[]> {
    return await menuRepository.findAllActive()
  }
}

export const permissionService = new PermissionService()
