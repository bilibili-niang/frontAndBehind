import { Context } from 'koa'
import { ctxBody } from '@/utils'
import { debug } from '@/config/log4j'

/**
 * Swagger 文档结构
 */
export interface SwaggerDocument {
  body?: Record<string, unknown>
  query?: Record<string, unknown>
  params?: Record<string, unknown>
}

/**
 * 校验类类型
 */
export interface ValidationClass {
  swaggerDocument?: SwaggerDocument
}

/**
 * 对 post 传参进行校验
 * @param ctx Koa 上下文
 * @param cla 校验类
 * @returns Promise
 */
const verificationPost = (ctx: Context, cla: ValidationClass): Promise<void> => {
  return new Promise((resolve, reject) => {
    debug(`swaggerDocument: ${JSON.stringify(cla.swaggerDocument)}`)

    const { body = null } = ctx.request
    if (!body) {
      ctx.body = ctxBody({
        msg: 'body 不能为空'
      })
      reject(new Error('body 不能为空'))
    } else {
      resolve()
    }
  })
}

/**
 * 为 ctx 挂载一个校验方法
 * 期望的校验方法应该是传入指定校验的 class，获取 class 的 swaggerDocument，然后对比 body 中的参数是否正确，如果不正确的话，响应对应的 description
 * @param ctx Koa 上下文
 * @param next 下一个中间件
 */
const validate = async (ctx: Context, next: () => Promise<void>): Promise<void> => {
  debug(`后置 ctx: ${JSON.stringify(ctx)}`)

  await next()
}


export { verificationPost, validate }
