import { Context, Next } from 'koa'
import { ctxBody, jwtDecryption, getTokenFromHeader } from '@/utils'
import User from '@/schema/user'
import { JWTPayload, KoaContextWithUser } from '@/types'

// 需要鉴权的路由占位（如需基于路径开关鉴权可使用）
export let needAuthRouters: string[] = []

// 全局中间件：如果请求头中携带了 token，则解密并把用户信息挂到 ctx 上
// 不强制要求存在 token（由路由级 jwtMust 进行强校验）
export const jwtMiddleware = async (ctx: Context, next: Next) => {
  try {
    const token = getTokenFromHeader(ctx)
    if (token) {
      try {
        const payload = jwtDecryption(token) as JWTPayload
        ;(ctx as KoaContextWithUser).decode = payload
        const userId = payload?.id
        if (userId) {
          const user = await User.findOne({ where: { id: String(userId) }, raw: true })
          if (user) (ctx as KoaContextWithUser).user = user
        }
      } catch (_) {
        // 忽略解密错误，交由路由级 jwtMust 处理
      }
    }
  } finally {
    await next()
  }
}

// 路由级强鉴权：必须携带有效 token，且用户存在
export const jwtMust = async (ctx: Context, next: Next) => {
  const token = getTokenFromHeader(ctx)
  if (!token) {
    ctx.status = 401
    ctx.body = ctxBody({ success: false, code: 401, msg: '未登录或缺少凭证', data: null })
    return
  }
  try {
    const payload = jwtDecryption(token) as JWTPayload
    const userId = payload?.id
    if (!userId) {
      ctx.status = 401
      ctx.body = ctxBody({ success: false, code: 401, msg: '登录状态异常：缺少用户ID', data: null })
      return
    }
    const user = await User.findOne({ where: { id: String(userId) }, raw: true })
    if (!user) {
      ctx.status = 401
      ctx.body = ctxBody({ success: false, code: 401, msg: '用户不存在或已删除', data: null })
      return
    }
    ;(ctx as KoaContextWithUser).decode = payload
    ;(ctx as KoaContextWithUser).user = user
    await next()
  } catch (_) {
    ctx.status = 401
    ctx.body = ctxBody({ success: false, code: 401, msg: '登录凭证无效或已过期', data: null })
  }
}
