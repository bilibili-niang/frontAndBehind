import { debug, error } from '@/config/log4j'

export default () => async (ctx, next) => {
  debug(`ctx: ${JSON.stringify(ctx)}`)

  try {
    await next()
  } catch (err: unknown) {
    const e = err as { message?: string, stack?: string }
    error(`错误: ${e.message}`)
    ctx.body = { msg: e?.message, stack: e?.stack }
  }
};
