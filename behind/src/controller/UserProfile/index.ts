import { Context } from 'koa'
import { routeConfig } from 'koa-swagger-decorator'
import { ctxBody, jwtDecryption } from '@/utils'
import User from '@/schema/user'

class UserProfileController {
  @routeConfig({
    method: 'get',
    path: '/getUserProfile',
    summary: '获取当前登录用户的基础信息与个人资料内容',
    tags: ['用户']
  })
  async getUserProfile(ctx: Context) {
    try {
      // 从请求头读取 Blade-Auth（JWT）
      const token = ctx.get('Blade-Auth') || (ctx.headers['blade-auth'] as string)
      if (!token) {
        ctx.body = ctxBody({ success: false, code: 401, msg: '未登录或缺少凭证', data: null })
        return
      }

      // 解密 JWT，获取用户ID
      let payload: any
      try {
        payload = jwtDecryption(token)
      } catch (e: any) {
        ctx.body = ctxBody({ success: false, code: 401, msg: '登录凭证无效或已过期', data: null })
        return
      }

      const userId = payload?.id
      if (!userId) {
        ctx.body = ctxBody({ success: false, code: 401, msg: '登录状态异常：缺少用户ID', data: null })
        return
      }

      // 查询用户信息
      const user = await User.findOne({ where: { id: userId }, raw: true })
      if (!user) {
        ctx.body = ctxBody({ success: false, code: 404, msg: '用户不存在', data: null })
        return
      }

      const data = {
        id: user.id,
        name: user.userName || '匿名用户',
        avatar: user.avatar || '/defaultAvatar.png',
        phone: user.phoneNumber || '',
        account: user.userName || '',
        merchantName: '',
        realName: null,
        status: typeof (user as any).status === 'number' ? (user as any).status : 1,
        merchantId: '',
        infoContent: {
          name: user.userName || '',
          gender: user.gender === '男' ? 1 : user.gender === '女' ? 0 : null
        }
      }

      ctx.body = ctxBody({ success: true, code: 200, msg: 'ok', data })
    } catch (e: any) {
      ctx.body = ctxBody({ success: false, code: 500, msg: e?.message || '获取用户信息失败', data: null })
    }
  }
  @routeConfig({
    method: 'get',
    path: '/null-cornerstone-system/me',
    summary: '兼容路径：当前用户信息',
    tags: ['用户']
  })
  async me(ctx: Context) {
    return this.getUserProfile(ctx)
  }

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
