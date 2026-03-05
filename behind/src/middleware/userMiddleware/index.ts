// 用户相关的中间件校验
import { Context, Next } from 'koa'
import { userService } from '@/service/UserService'

/**
 * 校验用户是否存在
 * 中间件只负责：调用 Service、处理响应
 * 业务逻辑在 UserService.checkUserExists() 中
 */
export const validateUserExist = async (ctx: Context, next: Next) => {
  const { userId: id } = ctx.request.body as { userId?: string }

  if (!id) {
    return ctx.throw(400, '用户ID不能为空')
  }

  const exists = await userService.checkUserExists(id)

  if (!exists) {
    return ctx.throw(400, '用户不存在')
  }

  await next()
}
