import { Op, WhereOptions } from 'sequelize'
import User from '@/schema/user'
import { BaseRepository } from './BaseRepository'

/**
 * 查找用户条件
 */
export interface FindUserCriteria {
  userName?: string
  phoneNumber?: string
  password?: string
}

/**
 * 用户数据更新类型
 */
export type UserUpdateData = Partial<{
  userName: string
  password: string
  phoneNumber: string
  email: string
  avatar: string
  gender: string
  isAdmin: boolean
  status: number
  roleId: number
}>

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
    const where: WhereOptions<User> = {}

    if (criteria.password) {
      where.password = criteria.password
    }

    if (criteria.userName) {
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

  /**
   * 更新用户
   * @param id 用户 ID
   * @param userData 用户数据
   * @returns 更新后的用户
   */
  async updateUser(id: string, userData: UserUpdateData): Promise<User | null> {
    const user = await this.findById(id)
    if (!user) {
      return null
    }
    return await user.update(userData)
  }
}

export const userRepository = new UserRepository()
