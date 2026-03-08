import { Context } from 'koa'
// Fix: Import JwtPayload from local module to avoid circular dependency and export issues
import { jwtDecryption, JwtPayload } from './jwtGenerateAndDecrypt'

/**
 * 扩展的 Context 类型，包含 decode 属性
 */
export interface ContextWithDecode extends Context {
  decode?: JwtPayload | string
}

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
  const decoded = (ctx as ContextWithDecode).decode
  if (decoded && typeof decoded !== 'string' && decoded.id) return String(decoded.id)
  
  const token = getTokenFromHeader(ctx)
  if (!token) return null
  try {
    const payload = jwtDecryption(token)
    if (typeof payload !== 'string' && payload?.id) {
      return String(payload.id)
    }
    return null
  } catch (_) {
    return null
  }
}
