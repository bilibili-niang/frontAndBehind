import { Context } from 'koa'
import { routeConfig } from 'koa-swagger-decorator'
import { ctxBody } from '@/utils'
import { userProfileService } from '@/service/UserProfileService'
import { getErrorMessage } from '@/types/controller'

/**
 * 用户资料控制器
 * 只负责：接收请求、调用 Service、返回响应
 */
class UserProfileController {
  /**
   * 获取当前登录用户的基础信息与个人资料内容
   */
  @routeConfig({
    method: 'get',
    path: '/getUserProfile',
    summary: '获取当前登录用户的基础信息与个人资料内容',
    tags: ['用户']
  })
  async getUserProfile(ctx: Context) {
    try {
      // 验证 Token
      const authResult = userProfileService.verifyToken(ctx)
      if (!authResult.success) {
        ctx.body = ctxBody({ success: false, code: authResult.code, msg: authResult.msg, data: null })
        return
      }

      // 获取用户资料
      const profile = await userProfileService.getUserProfile(authResult.payload!.id)

      if (!profile) {
        ctx.body = ctxBody({ success: false, code: 404, msg: '用户不存在', data: null })
        return
      }

      ctx.body = ctxBody({ success: true, code: 200, msg: 'ok', data: profile })
    } catch (e: unknown) {
      ctx.body = ctxBody({ success: false, code: 500, msg: getErrorMessage(e) || '获取用户信息失败', data: null })
    }
  }

  /**
   * 兼容路径：当前用户信息
   */
  @routeConfig({
    method: 'get',
    path: '/null-cornerstone-system/me',
    summary: '兼容路径：当前用户信息',
    tags: ['用户']
  })
  async me(ctx: Context) {
    return this.getUserProfile(ctx)
  }

  /**
   * 当前登录用户信息
   */
  @routeConfig({
    method: 'get',
    path: '/user/me',
    summary: '当前登录用户信息',
    tags: ['用户']
  })
  async currentUser(ctx: Context) {
    return this.getUserProfile(ctx)
  }
}

export { UserProfileController }
