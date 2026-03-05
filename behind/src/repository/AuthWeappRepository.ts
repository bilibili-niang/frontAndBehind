import AuthWeapp from '@/schema/authWeapp'
import { BaseRepository } from './BaseRepository'

/**
 * 微信小程序授权数据
 */
export interface AuthWeappData {
  id?: string
  openId: string
  sessionKey?: string
  unionId?: string
  userId?: string
  phoneNumber?: string
  [key: string]: any
}

/**
 * 微信小程序授权 Repository
 */
export class AuthWeappRepository extends BaseRepository<AuthWeapp> {
  constructor() {
    super(AuthWeapp)
  }

  /**
   * 根据 openId 查找授权记录
   */
  async findByOpenId(openId: string): Promise<AuthWeapp | null> {
    return await this.model.findOne({
      where: { openId },
      raw: false
    })
  }

  /**
   * 更新 sessionKey 和 unionId
   */
  async updateSession(openId: string, sessionKey: string, unionId?: string): Promise<void> {
    const row = await this.findByOpenId(openId)
    if (row) {
      await row.update({ sessionKey, unionId })
    }
  }

  /**
   * 绑定手机号和用户
   */
  async bindPhoneAndUser(openId: string, phoneNumber: string, userId: string): Promise<void> {
    const row = await this.findByOpenId(openId)
    if (row) {
      await row.update({ phoneNumber, userId })
    }
  }
}

export const authWeappRepository = new AuthWeappRepository()
