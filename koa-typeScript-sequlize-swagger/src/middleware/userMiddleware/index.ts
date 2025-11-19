// 用户相关的中间件校验
import { User } from '@/schema'
import { Context, Next } from 'koa'
// 校验用户是否存在
export const validateUserExist = async (ctx: Context, next: Next, e: any) => {
  const { userId: id } = ctx.request.body
  if (!id) {
    return ctx.throw(400, '用户ID不能为空')
  }
  const user = await User.findOne({
    where: {
      id
    }
  })
  if (!user) {
    return ctx.throw(400, '用户不存在')
  }
  await next()
}
