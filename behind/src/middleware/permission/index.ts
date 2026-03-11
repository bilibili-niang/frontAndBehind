import { Context, Next } from 'koa'
import { permissionService } from '@/service/PermissionService'
import { error } from '@/config/log4j'

/**
 * 权限元数据键
 */
export const PERMISSION_METADATA_KEY = Symbol('permission')

/**
 * 角色元数据键
 */
export const ROLE_METADATA_KEY = Symbol('role')

/**
 * 权限装饰器
 * 用于标记需要特定权限的接口
 * @param permissions 权限标识列表
 */
export function RequirePermission(...permissions: string[]): MethodDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const existingPermissions = Reflect.getMetadata(PERMISSION_METADATA_KEY, target, propertyKey) || []
    Reflect.defineMetadata(
      PERMISSION_METADATA_KEY,
      [...existingPermissions, ...permissions],
      target,
      propertyKey
    )
  }
}

/**
 * 角色装饰器
 * 用于标记需要特定角色的接口
 * @param roles 角色名称列表
 */
export function RequireRole(...roles: string[]): MethodDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const existingRoles = Reflect.getMetadata(ROLE_METADATA_KEY, target, propertyKey) || []
    Reflect.defineMetadata(
      ROLE_METADATA_KEY,
      [...existingRoles, ...roles],
      target,
      propertyKey
    )
  }
}

/**
 * 从 JWT Token 中解析用户ID
 * @param ctx Koa 上下文
 * @returns 用户ID或null
 */
function getUserIdFromToken(ctx: Context): string | null {
  try {
    const user = (ctx as any).state.user
    if (user && user.id) {
      return user.id
    }
    return null
  } catch (err) {
    return null
  }
}

/**
 * 权限检查中间件
 * 检查用户是否有访问接口的权限
 */
export async function permissionMiddleware(ctx: Context, next: Next): Promise<void> {
  const userId = getUserIdFromToken(ctx)

  if (!userId) {
    ctx.status = 401
    ctx.body = {
      code: 401,
      success: false,
      msg: '未登录或登录已过期'
    }
    return
  }

  // 获取当前请求的控制器和方法
  const controller = (ctx as any).controller
  const methodName = (ctx as any).methodName

  if (!controller || !methodName) {
    await next()
    return
  }

  try {
    // 获取方法上的权限要求
    const requiredPermissions: string[] = Reflect.getMetadata(
      PERMISSION_METADATA_KEY,
      controller.prototype,
      methodName
    ) || []

    // 获取方法上的角色要求
    const requiredRoles: string[] = Reflect.getMetadata(
      ROLE_METADATA_KEY,
      controller.prototype,
      methodName
    ) || []

    // 如果没有权限和角色要求，直接通过
    if (requiredPermissions.length === 0 && requiredRoles.length === 0) {
      await next()
      return
    }

    // 检查权限
    if (requiredPermissions.length > 0) {
      const userPermissions = await permissionService.getUserPermissions(userId)
      const hasPermission = requiredPermissions.every(p =>
        userPermissions.permissions.includes(p)
      )

      if (!hasPermission) {
        ctx.status = 403
        ctx.body = {
          code: 403,
          success: false,
          msg: `权限不足，需要权限: ${requiredPermissions.join(', ')}`
        }
        return
      }
    }

    // 检查角色
    if (requiredRoles.length > 0) {
      const userPermissions = await permissionService.getUserPermissions(userId)
      const hasRole = requiredRoles.some(r =>
        userPermissions.roles.includes(r)
      )

      if (!hasRole) {
        ctx.status = 403
        ctx.body = {
          code: 403,
          success: false,
          msg: `权限不足，需要角色: ${requiredRoles.join(', ')}`
        }
        return
      }
    }

    await next()
  } catch (err) {
    error('权限检查失败:', err)
    ctx.status = 500
    ctx.body = {
      code: 500,
      success: false,
      msg: '权限检查失败'
    }
  }
}

/**
 * 管理员权限中间件
 * 仅允许管理员访问
 */
export async function adminMiddleware(ctx: Context, next: Next): Promise<void> {
  const userId = getUserIdFromToken(ctx)

  if (!userId) {
    ctx.status = 401
    ctx.body = {
      code: 401,
      success: false,
      msg: '未登录或登录已过期'
    }
    return
  }

  try {
    const hasRole = await permissionService.hasRole(userId, 'admin')

    if (!hasRole) {
      ctx.status = 403
      ctx.body = {
        code: 403,
        success: false,
        msg: '需要管理员权限'
      }
      return
    }

    await next()
  } catch (err) {
    error('管理员权限检查失败:', err)
    ctx.status = 500
    ctx.body = {
      code: 500,
      success: false,
      msg: '权限检查失败'
    }
  }
}
