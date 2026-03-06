import { Context } from 'koa'
import { body, routeConfig, z } from 'koa-swagger-decorator'
import { ctxBody } from '@/utils'
import { authWeappService } from '@/service/AuthWeappService'
import { getErrorMessage } from '@/types/controller'

/**
 * 微信小程序认证控制器
 * 只负责：接收请求、调用 Service、返回响应
 */
class AuthWeappController {
  /**
   * 微信小程序一键登录
   * code 换 openid，判断是否已绑定手机号
   */
  @routeConfig({
    method: 'post',
    path: '/auth/weapp/login',
    summary: '微信小程序一键登录：code 换 openid，判断是否已绑定手机号',
    tags: ['认证']
  })
  @body(z.object({ code: z.string().nonempty() }))
  async weappLogin(ctx: Context) {
    try {
      const { code } = ctx.parsed?.body as { code: string }
      const result = await authWeappService.weappLogin(code)

      const msg = result.status === 1 ? '登录成功' : '需绑定手机号'
      ctx.body = ctxBody({ success: true, code: 200, msg, data: result })
    } catch (e: unknown) {
      ctx.body = ctxBody({ success: false, code: 500, msg: getErrorMessage(e) || '登录失败', data: null })
    }
  }

  /**
   * 绑定手机号并生成登录 token
   */
  @routeConfig({
    method: 'post',
    path: '/auth/weapp/bind',
    summary: '绑定手机号并生成登录 token',
    tags: ['认证']
  })
  @body(z.object({ openId: z.string().nonempty(), code: z.string().nonempty() }))
  async weappBind(ctx: Context) {
    try {
      const { openId, code } = ctx.parsed?.body as { openId: string; code: string }
      const result = await authWeappService.weappBind(openId, code)

      ctx.body = ctxBody({ success: true, code: 200, msg: '绑定并登录成功', data: result })
    } catch (e: unknown) {
      ctx.body = ctxBody({ success: false, code: 500, msg: getErrorMessage(e) || '绑定失败', data: null })
    }
  }
}

export { AuthWeappController }
