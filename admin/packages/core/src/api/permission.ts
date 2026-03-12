import request from './request'
import type { MenuTreeNode } from '../stores/permission'

/**
 * 权限项
 */
export interface Permission {
  id: string
  name: string
  displayName: string
  type: 'menu' | 'button' | 'api' | 'data'
  resource: string
  action: 'view' | 'create' | 'update' | 'delete'
  parentId?: string
  sort: number
  status: number
  createdAt: string
  updatedAt: string
}

/**
 * 角色
 */
export interface Role {
  id: string
  name: string
  displayName: string
  description: string
  status: number
  isDefault: boolean
  dataScope: number
  createdAt: string
  updatedAt: string
}

/**
 * 菜单
 */
export interface Menu {
  id: string
  name: string
  path: string
  component: string
  icon: string
  permission: string
  parentId?: string
  sort: number
  hidden: boolean
  keepAlive: boolean
  status: number
  createdAt: string
  updatedAt: string
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
 * 创建权限数据
 */
export interface CreatePermissionData {
  name: string
  displayName: string
  type: 'menu' | 'button' | 'api' | 'data'
  resource: string
  action: 'view' | 'create' | 'update' | 'delete'
  parentId?: string
  sort?: number
  status?: number
}

/**
 * 更新权限数据
 */
export interface UpdatePermissionData {
  displayName?: string
  type?: 'menu' | 'button' | 'api' | 'data'
  resource?: string
  action?: 'view' | 'create' | 'update' | 'delete'
  parentId?: string
  sort?: number
  status?: number
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
 * 更新菜单数据
 */
export interface UpdateMenuData {
  name?: string
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
 * 分配角色数据
 */
export interface AssignRoleData {
  userId: string
  roleIds: string[]
}

/**
 * 获取当前用户权限
 */
export const getCurrentPermissions = (): Promise<UserPermissionInfo> => {
  return request({
    url: '/api/permission/current',
    method: 'get'
  })
}

/**
 * 检查权限
 */
export const checkPermission = (permission: string): Promise<{ hasPermission: boolean }> => {
  return request({
    url: '/api/permission/check',
    method: 'post',
    data: { permission }
  })
}

/**
 * 获取权限列表
 */
export const getPermissionList = (): Promise<Permission[]> => {
  return request({
    url: '/api/permission/list',
    method: 'get'
  })
}

/**
 * 创建权限
 */
export const createPermission = (data: CreatePermissionData): Promise<Permission> => {
  return request({
    url: '/api/permission/create',
    method: 'post',
    data
  })
}

/**
 * 更新权限
 */
export const updatePermission = (id: string, data: UpdatePermissionData): Promise<Permission> => {
  return request({
    url: `/api/permission/update/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除权限
 */
export const deletePermission = (id: string): Promise<void> => {
  return request({
    url: `/api/permission/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 获取角色列表
 */
export const getRoleList = (): Promise<Role[]> => {
  return request({
    url: '/api/role/list',
    method: 'get'
  })
}

/**
 * 创建角色
 */
export const createRole = (data: CreateRoleData): Promise<Role> => {
  return request({
    url: '/api/role/create',
    method: 'post',
    data
  })
}

/**
 * 更新角色
 */
export const updateRole = (id: string, data: UpdateRoleData): Promise<Role> => {
  return request({
    url: `/api/role/update/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除角色
 */
export const deleteRole = (id: string): Promise<void> => {
  return request({
    url: `/api/role/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 为用户分配角色
 */
export const assignRolesToUser = (data: AssignRoleData): Promise<void> => {
  return request({
    url: '/api/role/assign',
    method: 'post',
    data
  })
}

/**
 * 获取用户的角色
 */
export const getUserRoles = (userId: string): Promise<Role[]> => {
  return request({
    url: `/api/role/user/${userId}`,
    method: 'get'
  })
}

/**
 * 获取菜单列表
 */
export const getMenuList = (): Promise<Menu[]> => {
  return request({
    url: '/api/menu/list',
    method: 'get'
  })
}

/**
 * 创建菜单
 */
export const createMenu = (data: CreateMenuData): Promise<Menu> => {
  return request({
    url: '/api/menu/create',
    method: 'post',
    data
  })
}

/**
 * 更新菜单
 */
export const updateMenu = (id: string, data: UpdateMenuData): Promise<Menu> => {
  return request({
    url: `/api/menu/update/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除菜单
 */
export const deleteMenu = (id: string): Promise<void> => {
  return request({
    url: `/api/menu/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 获取当前用户菜单
 */
export const getCurrentUserMenus = (): Promise<MenuTreeNode[]> => {
  return request({
    url: '/api/menu/current',
    method: 'get'
  })
}
