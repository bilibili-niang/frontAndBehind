import { Context, Next } from 'koa'
import { error } from '@/config/log4j'
import { ctxBody, formatError } from '@/utils'

/**
 * 错误类型枚举
 */
export enum ErrorCode {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_ERROR = 500
}

/**
 * 业务错误类
 * 用于区分业务错误和系统错误
 */
export class BusinessError extends Error {
  public code: number
  public data?: any

  constructor(message: string, code: number = ErrorCode.BAD_REQUEST, data?: any) {
    super(message)
    this.name = 'BusinessError'
    this.code = code
    this.data = data
  }
}

/**
 * 统一错误处理中间件
 * 捕获所有未处理的错误，统一格式化并返回
 *
 * 处理逻辑：
 * 1. 业务错误（BusinessError）：返回指定的状态码和错误信息
 * 2. 系统错误：返回 500 状态码，记录详细日志
 */
export const errorHandler = async (ctx: Context, next: Next) => {
  try {
    await next()
  } catch (err: any) {
    // 判断是否为业务错误
    if (err instanceof BusinessError) {
      ctx.status = err.code
      ctx.body = ctxBody({
        code: err.code,
        success: false,
        msg: err.message,
        data: err.data
      })
      return
    }

    // 系统错误处理
    ctx.status = err.status || ErrorCode.INTERNAL_ERROR

    // 记录错误日志
    error(JSON.stringify({
      message: err.message,
      stack: err.stack,
      name: err.name
    }), {
      ip: ctx.ip,
      method: ctx.method,
      path: ctx.path,
      statusCode: ctx.status,
      headers: ctx.headers,
      payload: ctx.request.body ?? ctx.query,
      userAgent: ctx.headers['user-agent'] as string
    })

    // 格式化错误响应
    const formatted = formatError(err)
    ctx.body = ctxBody({
      code: ctx.status,
      success: false,
      msg: formatted.message,
      data: process.env.NODE_ENV === 'development'
        ? { issues: formatted.issues, detail: formatted.detail, stack: err.stack }
        : { issues: formatted.issues }
    })
  }
}
