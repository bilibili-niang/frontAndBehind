import { Context } from 'koa'
import { jwtDecryption } from '@/utils'

// 统一从请求头中提取 JWT 的工具
// 支持以下几种常见写法：
// - Blade-Auth: <token>
// - blade-auth: <token>
// - bladeauth: <token>
// - Authorization: Bearer <token>
export const getTokenFromHeader = (ctx: Context): string | null => {
  const byGet = ctx.get('Blade-Auth') || ctx.get('blade-auth') || ctx.get('bladeauth')
  const fromHeaders = (ctx.headers['blade-auth'] as string) || (ctx.headers['bladeauth'] as string) || ''
  const bearer = (ctx.headers['authorization'] as string) || ''
  const tokenFromBearer = bearer && /^Bearer\s+/i.test(bearer) ? bearer.replace(/^Bearer\s+/i, '') : ''
  const token = byGet || fromHeaders || tokenFromBearer
  return token || null
}

// 获取当前登录用户的 ID
// 兼容 ctx.decode.id（若某些中间件已写入），否则尝试从请求头解密 JWT
export const getCurrentUserId = (ctx: Context): string | null => {
  const decoded: any = (ctx as any).decode
  if (decoded && decoded.id) return String(decoded.id)
  const token = getTokenFromHeader(ctx)
  if (!token) return null
  try {
    const payload: any = jwtDecryption(token)
    return payload?.id ? String(payload.id) : null
  } catch (_) {
    return null
  }
}