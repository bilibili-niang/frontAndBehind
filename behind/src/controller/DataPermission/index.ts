import { Context } from 'koa'
import { routeConfig, body, middlewares } from 'koa-swagger-decorator'
import { jwtMust } from '@/middleware'
import { dataPermissionService, DataScope } from '@/service/DataPermissionService'
import { successResponse, errorResponse } from '@/utils/response'
import { formatError } from '@/utils/error'
import { RequirePermission } from '@/middleware/permission'
import {
  CreateDataPermissionReq,
  UpdateDataPermissionReq,
  CheckDataPermissionReq
} from './type'
import { dataPermissionRepository } from '@/repository/DataPermissionRepository'

/**
 * 数据权限 Controller
 * 处理数据权限相关的 HTTP 请求
 */
class DataPermissionController {
  /**
   * 获取数据权限范围选项
   */
  @routeConfig({
    method: 'get',
    path: '/data-permission/scopes',
    summary: '获取数据权限范围选项',
    tags: ['数据权限管理'],
    description: '获取所有支持的数据权限范围选项'
  })
  @middlewares([jwtMust])
  async getDataScopes(ctx: Context) {
    try {
      const scopes = [
        { value: DataScope.ALL, label: '全部数据', description: '可查看所有数据' },
        { value: DataScope.DEPT, label: '本部门数据', description: '仅可查看本部门数据' },
        { value: DataScope.DEPT_AND_CHILD, label: '本部门及以下', description: '可查看本部门及下属部门数据' },
        { value: DataScope.SELF, label: '仅本人数据', description: '仅可查看自己创建的数据' },
        { value: DataScope.CUSTOM, label: '自定义', description: '自定义数据范围' }
      ]
      ctx.body = successResponse(scopes)
    } catch (err) {
      const formatted = formatError(err)
      ctx.body = errorResponse(formatted.message, 500)
    }
  }

  /**
   * 获取数据权限规则列表
   */
  @routeConfig({
    method: 'get',
    path: '/data-permission',
    summary: '获取数据权限规则列表',
    tags: ['数据权限管理'],
    description: '分页获取数据权限规则列表，支持按角色和资源类型筛选'
  })
  @middlewares([jwtMust, RequirePermission('button:data-permission:view')])
  async getList(ctx: Context) {
    try {
      const { roleId, resourceType, page, size } = ctx.query as {
        roleId?: string
        resourceType?: string
        page: string
        size: string
      }

      const pageNum = parseInt(page) || 1
      const pageSize = parseInt(size) || 10

      let where: any = { status: 1 }
      if (roleId) where.roleId = roleId
      if (resourceType) where.resourceType = resourceType

      const result = await dataPermissionRepository.paginate(
        { current: pageNum, size: pageSize },
        { where, order: [['createdAt', 'DESC']] }
      )

      ctx.body = successResponse({
        list: result.records,
        pagination: {
          page: result.current,
          size: result.size,
          total: result.total
        }
      })
    } catch (err) {
      const formatted = formatError(err)
      ctx.body = errorResponse(formatted.message, 500)
    }
  }

  /**
   * 获取当前用户的数据权限
   */
  @routeConfig({
    method: 'get',
    path: '/data-permission/current',
    summary: '获取当前用户的数据权限',
    tags: ['数据权限管理'],
    description: '获取当前登录用户对指定资源的数据权限'
  })
  @middlewares([jwtMust])
  async getCurrentDataPermission(ctx: Context) {
    try {
      const userId = ctx.state.user?.id
      const { resourceType } = ctx.query as { resourceType: string }

      if (!userId) {
        ctx.body = errorResponse('未登录', 401)
        return
      }

      if (!resourceType) {
        ctx.body = errorResponse('资源类型不能为空', 400)
        return
      }

      const { scope, condition } = await dataPermissionService.getUserDataScope(
        userId,
        resourceType
      )

      ctx.body = successResponse({
        resourceType,
        scope,
        condition
      })
    } catch (err) {
      const formatted = formatError(err)
      ctx.body = errorResponse(formatted.message, 500)
    }
  }

  /**
   * 创建数据权限规则
   */
  @routeConfig({
    method: 'post',
    path: '/data-permission',
    summary: '创建数据权限规则',
    tags: ['数据权限管理'],
    description: '为角色创建数据权限规则'
  })
  @middlewares([jwtMust, RequirePermission('button:data-permission:create')])
  @body(CreateDataPermissionReq)
  async create(ctx: Context) {
    try {
      const data = ctx.request.body as {
        roleId: string
        resourceType: string
        scope: DataScope
        customRule?: string
      }

      const permission = await dataPermissionService.setRoleDataPermission(
        data.roleId,
        data.resourceType,
        data.scope,
        data.customRule
      )

      ctx.body = successResponse(permission, '创建成功')
    } catch (err) {
      const formatted = formatError(err)
      ctx.body = errorResponse(formatted.message, 400)
    }
  }

  /**
   * 更新数据权限规则
   */
  @routeConfig({
    method: 'put',
    path: '/data-permission/:id',
    summary: '更新数据权限规则',
    tags: ['数据权限管理'],
    description: '更新数据权限规则'
  })
  @middlewares([jwtMust, RequirePermission('button:data-permission:update')])
  @body(UpdateDataPermissionReq)
  async update(ctx: Context) {
    try {
      const { id } = ctx.params
      const data = ctx.request.body as Partial<{
        scope: DataScope
        customRule: string
        status: number
      }>

      const permission = await dataPermissionRepository.findById(id)
      if (!permission) {
        ctx.body = errorResponse('数据权限规则不存在', 404)
        return
      }

      await permission.update(data)
      ctx.body = successResponse(permission, '更新成功')
    } catch (err) {
      const formatted = formatError(err)
      ctx.body = errorResponse(formatted.message, 400)
    }
  }

  /**
   * 删除数据权限规则
   */
  @routeConfig({
    method: 'delete',
    path: '/data-permission/:id',
    summary: '删除数据权限规则',
    tags: ['数据权限管理'],
    description: '删除数据权限规则'
  })
  @middlewares([jwtMust, RequirePermission('button:data-permission:delete')])
  async delete(ctx: Context) {
    try {
      const { id } = ctx.params
      const permission = await dataPermissionRepository.findById(id)

      if (!permission) {
        ctx.body = errorResponse('数据权限规则不存在', 404)
        return
      }

      await permission.destroy()
      ctx.body = successResponse(null, '删除成功')
    } catch (err) {
      const formatted = formatError(err)
      ctx.body = errorResponse(formatted.message, 400)
    }
  }

  /**
   * 检查数据权限
   */
  @routeConfig({
    method: 'post',
    path: '/data-permission/check',
    summary: '检查数据权限',
    tags: ['数据权限管理'],
    description: '检查当前用户是否有指定数据的访问权限'
  })
  @middlewares([jwtMust])
  @body(CheckDataPermissionReq)
  async checkPermission(ctx: Context) {
    try {
      const userId = ctx.state.user?.id
      const { resourceType, dataId } = ctx.request.body as {
        resourceType: string
        dataId: string
      }

      if (!userId) {
        ctx.body = errorResponse('未登录', 401)
        return
      }

      // 这里简化处理，实际应该查询数据的 owner
      const hasPermission = await dataPermissionService.checkDataPermission(
        userId,
        resourceType,
        dataId,
        userId // 简化：假设数据 owner 是当前用户
      )

      ctx.body = successResponse({ hasPermission })
    } catch (err) {
      const formatted = formatError(err)
      ctx.body = errorResponse(formatted.message, 500)
    }
  }
}

export default DataPermissionController
