import { Context } from 'koa'
import { body, routeConfig, responses, ParsedArgs, middlewares } from 'koa-swagger-decorator'
import { permissionService } from '@/service/PermissionService'
import { successResponse, errorResponse } from '@/utils/response'
import { formatError } from '@/utils/error'
import { jwtMust } from '@/middleware'
import { RequirePermission } from '@/middleware/permission'
import { CreateRoleReq, UpdateRoleReq, AssignRoleReq } from './type'

/**
 * 角色 Controller
 * 处理角色相关的 HTTP 请求
 */
class RoleController {
  /**
   * 获取角色列表
   */
  @routeConfig({
    method: 'get',
    path: '/role/list',
    summary: '获取角色列表',
    tags: ['角色管理'],
    description: '获取所有角色列表'
  })
  // @middlewares([jwtMust, RequirePermission('menu:role')])
  async getRoleList(ctx: Context) {
    try {
      console.log('getRoleList===>')
      const roles = await permissionService.getAllRoles()
      ctx.body = successResponse(roles)
    } catch (err) {
      const formatted = formatError(err)
      ctx.body = errorResponse(formatted.message, 500)
    }
  }

  /**
   * 创建角色
   */
  @routeConfig({
    method: 'post',
    path: '/role/create',
    summary: '创建角色',
    tags: ['角色管理'],
    description: '创建新角色'
  })
  @middlewares([jwtMust, RequirePermission('button:role:create')])
  @body(CreateRoleReq)
  async createRole(ctx: Context) {
    try {
      const data = ctx.request.body
      const role = await permissionService.createRole(data as any)
      ctx.body = successResponse(role, '创建角色成功')
    } catch (err) {
      const formatted = formatError(err)
      ctx.body = errorResponse(formatted.message, 400)
    }
  }

  /**
   * 更新角色
   */
  @routeConfig({
    method: 'put',
    path: '/role/update/:id',
    summary: '更新角色',
    tags: ['角色管理'],
    description: '更新角色信息'
  })
  @middlewares([jwtMust, RequirePermission('button:role:update')])
  @body(UpdateRoleReq)
  async updateRole(ctx: Context) {
    try {
      const { id } = ctx.params
      const data = ctx.request.body
      const role = await permissionService.updateRole(id, data as any)
      ctx.body = successResponse(role, '更新角色成功')
    } catch (err) {
      const formatted = formatError(err)
      ctx.body = errorResponse(formatted.message, 400)
    }
  }

  /**
   * 删除角色
   */
  @routeConfig({
    method: 'delete',
    path: '/role/delete/:id',
    summary: '删除角色',
    tags: ['角色管理'],
    description: '删除角色'
  })
  @middlewares([jwtMust, RequirePermission('button:role:delete')])
  async deleteRole(ctx: Context) {
    try {
      const { id } = ctx.params
      const result = await permissionService.deleteRole(id)
      ctx.body = successResponse({ success: result }, '删除角色成功')
    } catch (err) {
      const formatted = formatError(err)
      ctx.body = errorResponse(formatted.message, 400)
    }
  }

  /**
   * 为用户分配角色
   */
  @routeConfig({
    method: 'post',
    path: '/role/assign',
    summary: '为用户分配角色',
    tags: ['角色管理'],
    description: '为用户分配角色'
  })
  @middlewares([jwtMust, RequirePermission('button:role:assign')])
  @body(AssignRoleReq)
  async assignRolesToUser(ctx: Context) {
    try {
      const { userId, roleIds } = ctx.request.body as { userId: string; roleIds: string[] }
      await permissionService.assignRolesToUser(userId, roleIds)
      ctx.body = successResponse(null, '分配角色成功')
    } catch (err) {
      const formatted = formatError(err)
      ctx.body = errorResponse(formatted.message, 400)
    }
  }

  /**
   * 获取用户的角色
   */
  @routeConfig({
    method: 'get',
    path: '/role/user/:userId',
    summary: '获取用户的角色',
    tags: ['角色管理'],
    description: '获取指定用户的角色列表'
  })
  @middlewares([jwtMust, RequirePermission('menu:role')])
  async getUserRoles(ctx: Context) {
    try {
      const { userId } = ctx.params
      const roles = await permissionService.getUserRoles(userId)
      ctx.body = successResponse(roles)
    } catch (err) {
      const formatted = formatError(err)
      ctx.body = errorResponse(formatted.message, 500)
    }
  }

  /**
   * 为角色分配权限
   */
  @routeConfig({
    method: 'post',
    path: '/role/permission',
    summary: '为角色分配权限',
    tags: ['角色管理'],
    description: '为角色分配权限'
  })
  @middlewares([jwtMust, RequirePermission('button:role:permission')])
  async assignPermissionsToRole(ctx: Context) {
    try {
      const { roleId, permissionIds } = ctx.request.body as { roleId: string; permissionIds: string[] }
      await permissionService.assignPermissionsToRole(roleId, permissionIds)
      ctx.body = successResponse(null, '分配权限成功')
    } catch (err) {
      const formatted = formatError(err)
      ctx.body = errorResponse(formatted.message, 400)
    }
  }

  /**
   * 获取角色的权限
   */
  @routeConfig({
    method: 'get',
    path: '/role/permission/:roleId',
    summary: '获取角色的权限',
    tags: ['角色管理'],
    description: '获取角色的权限列表'
  })
  @middlewares([jwtMust, RequirePermission('menu:role')])
  async getRolePermissions(ctx: Context) {
    try {
      const { roleId } = ctx.params
      const permissions = await permissionService.getRolePermissions(roleId)
      ctx.body = successResponse(permissions)
    } catch (err) {
      const formatted = formatError(err)
      ctx.body = errorResponse(formatted.message, 500)
    }
  }
}

export { RoleController }
