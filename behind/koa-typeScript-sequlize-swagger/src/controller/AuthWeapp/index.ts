import { Context } from 'koa'
import { body, routeConfig, z } from 'koa-swagger-decorator'
import { ctxBody, jwtEncryption } from '@/utils'
import { jscode2session, getUserPhoneNumber } from '@/service/wechat'
import AuthWeapp from '@/schema/authWeapp'
import User from '@/schema/user'

const ensureUserByPhone = async (phoneNumber: string) => {
  let user = await User.findOne({ where: { phoneNumber } })
  if (!user) {
    user = await User.create({ userName: `用户${phoneNumber.slice(-4)}`, password: '', phoneNumber })
  }
  return user
}

class AuthWeappController {
  @routeConfig({
    method: 'post',
    path: '/auth/weapp/login',
    summary: '微信小程序一键登录：code 换 openid，判断是否已绑定手机号',
    tags: ['认证']
  })
  @body(z.object({ code: z.string().nonempty() }))
  async weappLogin(ctx: Context) {
    try {
      const { code } = ctx.parsed.body as any
      const { openid, session_key, unionid } = await jscode2session(code)
      let row = await AuthWeapp.findOne({ where: { openId: openid }, raw: false })
      if (!row) {
        row = await AuthWeapp.create({ openId: openid, sessionKey: session_key, unionId: unionid })
      } else {
        await row.update({ sessionKey: session_key, unionId: unionid })
      }

      // 已绑定手机号/用户则直接返回 token
      if (row.userId || row.phoneNumber) {
        let user: any = null
        if (row.userId) {
          user = await User.findOne({ where: { id: row.userId }, raw: false })
        }
        if (!user && row.phoneNumber) {
          user = await ensureUserByPhone(row.phoneNumber)
          await row.update({ userId: user.id })
        }
        if (user) {
          const token = jwtEncryption({ id: user.id })
          ctx.body = ctxBody({ success: true, code: 200, msg: '登录成功', data: { openid, status: 1, directToken: token } })
          return
        }
      }

      ctx.body = ctxBody({ success: true, code: 200, msg: '需绑定手机号', data: { openid, status: 2 } })
    } catch (e: any) {
      ctx.body = ctxBody({ success: false, code: 500, msg: e?.message || '登录失败', data: null })
    }
  }

  @routeConfig({
    method: 'post',
    path: '/auth/weapp/bind',
    summary: '绑定手机号并生成登录 token',
    tags: ['认证']
  })
  @body(z.object({ openId: z.string().nonempty(), code: z.string().nonempty() }))
  async weappBind(ctx: Context) {
    try {
      const { openId, code } = ctx.parsed.body as any
      const phone = await getUserPhoneNumber(code)
      const row = await AuthWeapp.findOne({ where: { openId }, raw: false })
      if (!row) {
        ctx.body = ctxBody({ success: false, code: 404, msg: 'openId 未注册，请先登录获取', data: null })
        return
      }
      const user = await ensureUserByPhone(phone)
      await row.update({ phoneNumber: phone, userId: user.id })
      const token = jwtEncryption({ id: user.id })
      ctx.body = ctxBody({ success: true, code: 200, msg: '绑定并登录成功', data: { status: 1, directToken: token } })
    } catch (e: any) {
      ctx.body = ctxBody({ success: false, code: 500, msg: e?.message || '绑定失败', data: null })
    }
  }
}

export { AuthWeappController }