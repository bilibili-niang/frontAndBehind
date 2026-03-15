import request from './request'
import type { MenuTreeNode } from '../stores/permission'

const requestData = <T>(config: any): Promise<T> => {
  return request<T>(config).then((res: any) => res?.data as T)
}

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
  return requestData({
    url: '/api/permission/current',
    method: 'get'
  })
}

/**
 * 检查权限
 */
export const checkPermission = (permission: string): Promise<{ hasPermission: boolean }> => {
  return requestData({
    url: '/api/permission/check',
    method: 'post',
    data: { permission }
  })
}

/**
 * 获取权限列表
 */
export const getPermissionList = (): Promise<Permission[]> => {
  return requestData({
    url: '/api/permission/list',
    method: 'get'
  })
}

/**
 * 创建权限
 */
export const createPermission = (data: CreatePermissionData): Promise<Permission> => {
  return requestData({
    url: '/api/permission/create',
    method: 'post',
    data
  })
}

/**
 * 更新权限
 */
export const updatePermission = (id: string, data: UpdatePermissionData): Promise<Permission> => {
  return requestData({
    url: `/api/permission/update/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除权限
 */
export const deletePermission = (id: string): Promise<void> => {
  return requestData({
    url: `/api/permission/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 获取角色列表
 */
export const getRoleList = (): Promise<Role[]> => {
  return requestData({
    url: '/api/role/list',
    method: 'get'
  })
}

/**
 * 创建角色
 */
export const createRole = (data: CreateRoleData): Promise<Role> => {
  return requestData({
    url: '/api/role/create',
    method: 'post',
    data
  })
}

/**
 * 更新角色
 */
export const updateRole = (id: string, data: UpdateRoleData): Promise<Role> => {
  return requestData({
    url: `/api/role/update/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除角色
 */
export const deleteRole = (id: string): Promise<void> => {
  return requestData({
    url: `/api/role/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 为用户分配角色
 */
export const assignRolesToUser = (data: AssignRoleData): Promise<void> => {
  return requestData({
    url: '/api/role/assign',
    method: 'post',
    data
  })
}

/**
 * 获取用户的角色
 */
export const getUserRoles = (userId: string): Promise<Role[]> => {
  return requestData({
    url: `/api/role/user/${userId}`,
    method: 'get'
  })
}

/**
 * 为角色分配权限
 */
export interface AssignPermissionData {
  roleId: string
  permissionIds: string[]
}

export const assignPermissionsToRole = (data: AssignPermissionData): Promise<void> => {
  return requestData({
    url: '/api/role/permission',
    method: 'post',
    data
  })
}

/**
 * 获取角色的权限
 */
export const getRolePermissions = (roleId: string): Promise<Permission[]> => {
  return requestData({
    url: `/api/role/permission/${roleId}`,
    method: 'get'
  })
}

/**
 * 获取菜单列表
 */
export const getMenuList = (): Promise<Menu[]> => {
  return requestData({
    url: '/api/menu/list',
    method: 'get'
  })
}

/**
 * 创建菜单
 */
export const createMenu = (data: CreateMenuData): Promise<Menu> => {
  return requestData({
    url: '/api/menu/create',
    method: 'post',
    data
  })
}

/**
 * 更新菜单
 */
export const updateMenu = (id: string, data: UpdateMenuData): Promise<Menu> => {
  return requestData({
    url: `/api/menu/update/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除菜单
 */
export const deleteMenu = (id: string): Promise<void> => {
  return requestData({
    url: `/api/menu/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 获取当前用户菜单
 */
export const getCurrentUserMenus = (): Promise<MenuTreeNode[]> => {
  return requestData({
    url: '/api/menu/current',
    method: 'get'
  })
}

// ==================== 数据权限 API ====================

/**
 * 数据权限范围
 */
export interface DataScope {
  value: number
  label: string
  description: string
}

/**
 * 数据权限规则
 */
export interface DataPermission {
  id: string
  roleId: string
  resourceType: string
  scope: number
  customRule?: string
  status: number
  createdAt: string
  updatedAt: string
}

/**
 * 创建数据权限规则数据
 */
export interface CreateDataPermissionData {
  roleId: string
  resourceType: string
  scope: number
  customRule?: string
  status?: number
}

/**
 * 更新数据权限规则数据
 */
export interface UpdateDataPermissionData {
  scope?: number
  customRule?: string
  status?: number
}

/**
 * 获取数据权限范围选项
 */
export const getDataScopes = (): Promise<DataScope[]> => {
  return requestData({
    url: '/api/data-permission/scopes',
    method: 'get'
  })
}

/**
 * 获取数据权限规则列表
 */
export const getDataPermissionList = (params?: {
  roleId?: string
  resourceType?: string
  page?: number
  size?: number
}): Promise<{ list: DataPermission[]; pagination: { page: number; size: number; total: number } }> => {
  return requestData({
    url: '/api/data-permission',
    method: 'get',
    params
  })
}

/**
 * 获取当前用户的数据权限
 */
export const getCurrentDataPermission = (resourceType: string): Promise<{
  resourceType: string
  scope: number
  condition: { deptIds?: string[]; userIds?: string[] }
}> => {
  return requestData({
    url: '/api/data-permission/current',
    method: 'get',
    params: { resourceType }
  })
}

/**
 * 创建数据权限规则
 */
export const createDataPermission = (data: CreateDataPermissionData): Promise<DataPermission> => {
  return requestData({
    url: '/api/data-permission',
    method: 'post',
    data
  })
}

/**
 * 更新数据权限规则
 */
export const updateDataPermission = (id: string, data: UpdateDataPermissionData): Promise<DataPermission> => {
  return requestData({
    url: `/api/data-permission/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除数据权限规则
 */
export const deleteDataPermission = (id: string): Promise<void> => {
  return requestData({
    url: `/api/data-permission/${id}`,
    method: 'delete'
  })
}

/**
 * 检查数据权限
 */
export const checkDataPermission = (resourceType: string, dataId: string): Promise<{ hasPermission: boolean }> => {
  return requestData({
    url: '/api/data-permission/check',
    method: 'post',
    data: { resourceType, dataId }
  })
}
