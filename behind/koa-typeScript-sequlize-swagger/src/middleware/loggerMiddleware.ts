import { Context, Next } from 'koa'
import { trace } from '@/config/log4j'

export const loggerMiddleware = async (ctx: Context, next: Next) => {
  const start = Date.now()

  // 获取真实IP地址
  const ip = ctx.request.ip ||
    ctx.get('x-forwarded-for') ||
    ctx.get('x-real-ip') ||
    ctx.ip

  // 记录请求开始
  trace(`请求开始 - ${ctx.method} ${ctx.url}`, { ip })

  try {
    await next()

    // 记录请求完成和响应时间
    const ms = Date.now() - start
    trace(`请求结束 - ${ctx.method} ${ctx.url} - 状态码:${ctx.status} - 响应时间:${ms}ms`, { ip })
  } catch (error) {
    // 记录错误
    const ms = Date.now() - start
    trace(`请求错误 - ${ctx.method} ${ctx.url} - 状态码:${ctx.status} - 响应时间:${ms}ms - 错误信息:${error.message}`, { ip })
    throw error
  }
}
