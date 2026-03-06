import { authWeappRepository, AuthWeappData } from '@/repository/AuthWeappRepository'
import { userRepository } from '@/repository/UserRepository'
import { jscode2session, getUserPhoneNumber } from '@/service/wechat'
import { jwtEncryption } from '@/utils'

/**
 * 微信登录结果
 */
export interface WeappLoginResult {
  openid: string
  status: 1 | 2  // 1: 已绑定，直接登录；2: 需绑定手机号
  directToken?: string
}

/**
 * 绑定结果
 */
export interface WeappBindResult {
  status: 1
  directToken: string
}

/**
 * 微信小程序授权 Service
 */
export class AuthWeappService {
  /**
   * 确保用户存在（根据手机号）
   * 如果不存在则创建新用户
   */
  private async ensureUserByPhone(phoneNumber: string) {
    let user = await userRepository.findByCredentials({ phoneNumber })

    if (!user) {
      user = await userRepository.create({
        userName: `用户${phoneNumber.slice(-4)}`,
        password: '',
        phoneNumber
      })
    }

    return user
  }

  /**
   * 微信小程序登录
   * @param code 微信登录码
   * @returns 登录结果
   */
  async weappLogin(code: string): Promise<WeappLoginResult> {
    // 调用微信接口获取 openid 和 session_key
    const { openid, session_key, unionid } = await jscode2session(code)

    // 查找或创建授权记录
    let row = await authWeappRepository.findByOpenId(openid)

    if (!row) {
      row = await authWeappRepository.create({
        openId: openid,
        sessionKey: session_key,
        unionId: unionid
      })
    } else {
      await authWeappRepository.updateSession(openid, session_key, unionid)
    }

    // 已绑定手机号/用户则直接返回 token
    if (row.userId || row.phoneNumber) {
      let user: Awaited<ReturnType<typeof userRepository.findById>> = null

      if (row.userId) {
        user = await userRepository.findById(row.userId)
      }

      if (!user && row.phoneNumber) {
        user = await this.ensureUserByPhone(row.phoneNumber)
        await authWeappRepository.bindPhoneAndUser(openid, row.phoneNumber, user.id)
      }

      if (user) {
        const token = jwtEncryption({ id: user.id })
        return {
          openid,
          status: 1,
          directToken: token
        }
      }
    }

    // 需要绑定手机号
    return {
      openid,
      status: 2
    }
  }

  /**
   * 绑定手机号并登录
   * @param openId 微信 openId
   * @param code 微信手机号获取码
   * @returns 绑定结果
   */
  async weappBind(openId: string, code: string): Promise<WeappBindResult> {
    // 获取手机号
    const phone = await getUserPhoneNumber(code)

    // 检查 openId 是否存在
    const row = await authWeappRepository.findByOpenId(openId)
    if (!row) {
      throw new Error('openId 未注册，请先登录获取')
    }

    // 确保用户存在
    const user = await this.ensureUserByPhone(phone)

    // 绑定手机号和用户
    await authWeappRepository.bindPhoneAndUser(openId, phone, user.id)

    // 生成 token
    const token = jwtEncryption({ id: user.id })

    return {
      status: 1,
      directToken: token
    }
  }
}

export const authWeappService = new AuthWeappService()
