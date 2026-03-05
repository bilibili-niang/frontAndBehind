import { Op } from 'sequelize'
import User from '@/schema/user'
import { BaseRepository } from './BaseRepository'

/**
 * 查找用户条件
 */
export interface FindUserCriteria {
  account?: string
  userName?: string
  phoneNumber?: string
  password?: string
}

/**
 * 用户 Repository
 * 负责用户相关的数据访问
 */
export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User)
  }

  /**
   * 根据条件查找用户
   * @param criteria 查询条件
   * @returns 用户实例或 null
   */
  async findByCredentials(criteria: FindUserCriteria): Promise<User | null> {
    const where: any = {}

    if (criteria.password) {
      where.password = criteria.password
    }

    if (criteria.account) {
      where[Op.or] = [
        { userName: criteria.account },
        { phoneNumber: criteria.account }
      ]
    } else if (criteria.userName) {
      where.userName = criteria.userName
    } else if (criteria.phoneNumber) {
      where.phoneNumber = criteria.phoneNumber
    }

    return await this.model.findOne({ where })
  }

  /**
   * 分页查询用户列表（排除密码字段）
   * @param current 当前页
   * @param size 每页大小
   * @returns 分页结果
   */
  async findUserList(current: number, size: number) {
    return await this.paginate(
      { current, size },
      { attributes: { exclude: ['password'] } }
    )
  }
}

export const userRepository = new UserRepository()
