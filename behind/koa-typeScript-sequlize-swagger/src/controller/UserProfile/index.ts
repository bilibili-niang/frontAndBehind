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

      // 映射为前端期望的结构
      const data = {
        id: user.id,
        name: user.userName || '匿名用户',
        avatar: user.avatar || '/defaultAvatar.png',
        phone: user.phoneNumber || '',
        // 个人资料内容（用于用户信息设置页等）
        infoContent: {
          name: user.userName || '',
          // 性别：1 男，0 女，null 保密
          gender:
            user.gender === '男' ? 1 : user.gender === '女' ? 0 : null
          // 可在此扩展更多字段：address、height、faceImage 等
        }
      }

      ctx.body = ctxBody({ success: true, code: 200, msg: 'ok', data })
    } catch (e: any) {
      ctx.body = ctxBody({ success: false, code: 500, msg: e?.message || '获取用户信息失败', data: null })
    }
  }
}

export { UserProfileController }