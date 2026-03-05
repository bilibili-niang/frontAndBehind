import { userRepository } from '@/repository/UserRepository'
import { jwtDecryption } from '@/utils'
import { Context } from 'koa'

/**
 * 用户信息内容
 */
export interface UserInfoContent {
  name: string
  gender: number | null
}

/**
 * 用户资料
 */
export interface UserProfile {
  id: string
  name: string
  avatar: string
  phone: string
  account: string
  merchantName: string
  realName: null
  status: number
  merchantId: string
  infoContent: UserInfoContent
}

/**
 * JWT 解密结果
 */
export interface JwtPayload {
  id: string
  [key: string]: any
}

/**
 * 验证结果
 */
export interface AuthResult {
  success: boolean
  code: number
  msg: string
  payload?: JwtPayload
}

/**
 * 用户资料 Service
 * 处理用户资料相关的业务逻辑
 */
export class UserProfileService {
  /**
   * 验证 JWT Token
   * @param ctx Koa 上下文
   * @returns 验证结果
   */
  verifyToken(ctx: Context): AuthResult {
    const token = ctx.get('Blade-Auth') || (ctx.headers['blade-auth'] as string)

    if (!token) {
      return { success: false, code: 401, msg: '未登录或缺少凭证' }
    }

    try {
      const payload = jwtDecryption(token) as JwtPayload

      if (!payload?.id) {
        return { success: false, code: 401, msg: '登录状态异常：缺少用户ID' }
      }

      return { success: true, code: 200, msg: 'ok', payload }
    } catch (e: any) {
      return { success: false, code: 401, msg: '登录凭证无效或已过期' }
    }
  }

  /**
   * 获取用户资料
   * @param userId 用户ID
   * @returns 用户资料或null
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const user = await userRepository.findById(userId)

    if (!user) {
      return null
    }

    const plain = typeof user.toJSON === 'function' ? user.toJSON() : user

    return {
      id: plain.id,
      name: plain.userName || '匿名用户',
      avatar: plain.avatar || '/defaultAvatar.png',
      phone: plain.phoneNumber || '',
      account: plain.userName || '',
      merchantName: '',
      realName: null,
      status: typeof plain.status === 'number' ? plain.status : 1,
      merchantId: '',
      infoContent: {
        name: plain.userName || '',
        gender: plain.gender === '男' ? 1 : plain.gender === '女' ? 0 : null
      }
    }
  }
}

export const userProfileService = new UserProfileService()
