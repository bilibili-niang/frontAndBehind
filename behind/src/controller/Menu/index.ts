import { Context } from 'koa'
import { body, routeConfig, responses, ParsedArgs, middlewares } from 'koa-swagger-decorator'
import { permissionService } from '@/service/PermissionService'
import { successResponse, errorResponse } from '@/utils/response'
import { formatError } from '@/utils/error'
import { jwtMust } from '@/middleware'
import { RequirePermission } from '@/middleware/permission'
import { CreateMenuReq, UpdateMenuReq } from './type'

/**
 * 菜单 Controller
 * 处理菜单相关的 HTTP 请求
 */
class MenuController {
  /**
   * 获取菜单列表
   */
  @routeConfig({
    method: 'get',
    path: '/menu/list',
    summary: '获取菜单列表',
    tags: ['菜单管理'],
    description: '获取所有菜单列表'
  })
  @middlewares([jwtMust, RequirePermission('menu:menu')])
  async getMenuList(ctx: Context) {
    try {
      const menus = await permissionService.getAllMenus()
      ctx.body = successResponse(menus)
    } catch (err) {
      const formatted = formatError(err)
      ctx.body = errorResponse(formatted.message, 500)
    }
  }

  /**
   * 创建菜单
   */
  @routeConfig({
    method: 'post',
    path: '/menu/create',
    summary: '创建菜单',
    tags: ['菜单管理'],
    description: '创建新菜单'
  })
  @middlewares([jwtMust, RequirePermission('button:menu:create')])
  @body(CreateMenuReq)
  async createMenu(ctx: Context) {
    try {
      const data = ctx.request.body
      const menu = await permissionService.createMenu(data as any)
      ctx.body = successResponse(menu, '创建菜单成功')
    } catch (err) {
      const formatted = formatError(err)
      ctx.body = errorResponse(formatted.message, 400)
    }
  }

  /**
   * 更新菜单
   */
  @routeConfig({
    method: 'put',
    path: '/menu/update/:id',
    summary: '更新菜单',
    tags: ['菜单管理'],
    description: '更新菜单信息'
  })
  @middlewares([jwtMust, RequirePermission('button:menu:update')])
  @body(UpdateMenuReq)
  async updateMenu(ctx: Context) {
    try {
      const { id } = ctx.params
      const data = ctx.request.body
      // TODO: 实现更新菜单服务方法
      ctx.body = successResponse(null, '更新菜单成功')
    } catch (err) {
      const formatted = formatError(err)
      ctx.body = errorResponse(formatted.message, 400)
    }
  }

  /**
   * 删除菜单
   */
  @routeConfig({
    method: 'delete',
    path: '/menu/delete/:id',
    summary: '删除菜单',
    tags: ['菜单管理'],
    description: '删除菜单'
  })
  @middlewares([jwtMust, RequirePermission('button:menu:delete')])
  async deleteMenu(ctx: Context) {
    try {
      const { id } = ctx.params
      // TODO: 实现删除菜单服务方法
      ctx.body = successResponse(null, '删除菜单成功')
    } catch (err) {
      const formatted = formatError(err)
      ctx.body = errorResponse(formatted.message, 400)
    }
  }

  /**
   * 获取当前用户菜单
   */
  @routeConfig({
    method: 'get',
    path: '/menu/current',
    summary: '获取当前用户菜单',
    tags: ['菜单管理'],
    description: '获取当前登录用户的菜单树'
  })
  @middlewares([jwtMust])
  async getCurrentUserMenus(ctx: Context) {
    try {
      const userId = ctx.state.user?.id
      if (!userId) {
        ctx.body = errorResponse('未登录', 401)
        return
      }

      const permissions = await permissionService.getUserPermissions(userId)
      ctx.body = successResponse(permissions.menus)
    } catch (err) {
      const formatted = formatError(err)
      ctx.body = errorResponse(formatted.message, 500)
    }
  }
}

export default MenuController
