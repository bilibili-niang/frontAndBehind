import { Context } from 'koa'
import { body, routeConfig, responses, ParsedArgs, middlewares } from 'koa-swagger-decorator'
import { permissionService } from '@/service/PermissionService'
import { successResponse, errorResponse } from '@/utils/response'
import { formatError } from '@/utils/error'
import { jwtMust } from '@/middleware'
import { RequirePermission } from '@/middleware/permission'
import { CreatePermissionReq, UpdatePermissionReq, CheckPermissionReq } from './type'

/**
 * 权限 Controller
 * 处理权限相关的 HTTP 请求
 */
class PermissionController {
  /**
   * 获取当前用户权限
   */
  @routeConfig({
    method: 'get',
    path: '/permission/current',
    summary: '获取当前用户权限',
    tags: ['权限管理'],
    description: '获取当前登录用户的权限列表和菜单'
  })
  @middlewares([jwtMust])
  async getCurrentPermissions(ctx: Context) {
    try {
      const userId = ctx.state.user?.id
      if (!userId) {
        ctx.body = errorResponse('未登录', 401)
        return
      }

      const permissions = await permissionService.getUserPermissions(userId)
      ctx.body = successResponse(permissions)
    } catch (err) {
      const formatted = formatError(err)
      ctx.body = errorResponse(formatted.message, 500)
    }
  }

  /**
   * 检查权限
   */
  @routeConfig({
    method: 'post',
    path: '/permission/check',
    summary: '检查权限',
    tags: ['权限管理'],
    description: '检查当前用户是否有指定权限'
  })
  @middlewares([jwtMust])
  @body(CheckPermissionReq)
  async checkPermission(ctx: Context) {
    try {
      const userId = ctx.state.user?.id
      if (!userId) {
        ctx.body = errorResponse('未登录', 401)
        return
      }

      const { permission } = ctx.request.body as { permission: string }
      const hasPermission = await permissionService.hasPermission(userId, permission)

      ctx.body = successResponse({ hasPermission })
    } catch (err) {
      const formatted = formatError(err)
      ctx.body = errorResponse(formatted.message, 500)
    }
  }

  /**
   * 获取所有权限
   */
  @routeConfig({
    method: 'get',
    path: '/permission/list',
    summary: '获取权限列表',
    tags: ['权限管理'],
    description: '获取所有权限列表'
  })
  // @middlewares([jwtMust, RequirePermission('menu:permission')])
  async getPermissionList(ctx: Context) {
    try {
      const permissions = await permissionService.getAllPermissions()
      ctx.body = successResponse(permissions)
    } catch (err) {
      const formatted = formatError(err)
      ctx.body = errorResponse(formatted.message, 500)
    }
  }

  /**
   * 创建权限
   */
  @routeConfig({
    method: 'post',
    path: '/permission/create',
    summary: '创建权限',
    tags: ['权限管理'],
    description: '创建新权限'
  })
  @middlewares([jwtMust, RequirePermission('button:permission:create')])
  @body(CreatePermissionReq)
  async createPermission(ctx: Context) {
    try {
      const data = ctx.request.body
      const permission = await permissionService.createPermission(data as any)
      ctx.body = successResponse(permission, '创建权限成功')
    } catch (err) {
      const formatted = formatError(err)
      ctx.body = errorResponse(formatted.message, 400)
    }
  }

  /**
   * 更新权限
   */
  @routeConfig({
    method: 'put',
    path: '/permission/update/:id',
    summary: '更新权限',
    tags: ['权限管理'],
    description: '更新权限信息'
  })
  @middlewares([jwtMust, RequirePermission('button:permission:update')])
  @body(UpdatePermissionReq)
  async updatePermission(ctx: Context) {
    try {
      const { id } = ctx.params
      const data = ctx.request.body
      // TODO: 实现更新权限服务方法
      ctx.body = successResponse(null, '更新权限成功')
    } catch (err) {
      const formatted = formatError(err)
      ctx.body = errorResponse(formatted.message, 400)
    }
  }

  /**
   * 删除权限
   */
  @routeConfig({
    method: 'delete',
    path: '/permission/delete/:id',
    summary: '删除权限',
    tags: ['权限管理'],
    description: '删除权限'
  })
  @middlewares([jwtMust, RequirePermission('button:permission:delete')])
  async deletePermission(ctx: Context) {
    try {
      const { id } = ctx.params
      // TODO: 实现删除权限服务方法
      ctx.body = successResponse(null, '删除权限成功')
    } catch (err) {
      const formatted = formatError(err)
      ctx.body = errorResponse(formatted.message, 400)
    }
  }
}

export { PermissionController }
