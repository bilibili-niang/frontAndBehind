import md5 from 'md5'
import { userRepository, FindUserCriteria } from '@/repository/UserRepository'
import { jwtEncryption } from '@/utils'
import { UserInfo } from '@/types'

/**
 * 登录凭证
 */
export interface LoginCredentials {
  account?: string
  userName?: string
  phoneNumber?: string
  password: string
}

/**
 * 登录结果
 */
export interface LoginResult {
  token: string
  userInfo: UserInfo
}

/**
 * 创建用户数据
 */
export interface CreateUserData {
  userName: string
  password: string
  phoneNumber?: string
  email?: string
  avatar?: string
  gender?: string
  [key: string]: any
}

/**
 * 用户 Service
 * 处理用户相关的业务逻辑
 */
export class UserService {
  /**
   * 用户登录
   * @param credentials 登录凭证
   * @returns 登录结果
   * @throws Error 登录失败时抛出错误
   */
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    const { account, userName, phoneNumber, password } = credentials

    // 验证至少提供一个账号标识
    if (!account && !userName && !phoneNumber) {
      throw new Error('账号错误：account、userName 或 phoneNumber 至少提供一个')
    }

    // 构建查询条件
    const criteria: FindUserCriteria = {
      password: md5(password)
    }

    if (account) {
      criteria.account = account
    } else if (userName) {
      criteria.userName = userName
    } else if (phoneNumber) {
      criteria.phoneNumber = phoneNumber
    }

    // 查询用户
    const user = await userRepository.findByCredentials(criteria)

    if (!user) {
      throw new Error('用户不存在或密码错误')
    }

    // 转换为普通对象
    const plain = typeof user.toJSON === 'function' ? user.toJSON() : user

    // 移除密码字段
    const { password: _, ...userWithoutPassword } = plain as any

    // 生成 JWT
    const token = jwtEncryption(userWithoutPassword)

    // 构建用户信息
    const userInfo: UserInfo = {
      id: plain.id,
      userName: plain.userName,
      avatar: plain.avatar,
      phoneNumber: plain.phoneNumber,
      email: plain.email,
      gender: plain.gender,
      isAdmin: plain.isAdmin,
      status: plain.status,
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
    }

    return { token, userInfo }
  }

  /**
   * 创建用户
   * @param userData 用户数据
   * @returns 创建的用户
   */
  async create(userData: CreateUserData) {
    const { password, ...restData } = userData

    // 业务规则：管理员状态必须为 1
    let status = restData.status
    if (restData.isAdmin === true || restData.isAdmin === 1) {
      status = 1
    }

    return await userRepository.create({
      ...restData,
      password: md5(password),
      status
    })
  }

  /**
   * 获取用户列表
   * @param current 当前页
   * @param size 每页大小
   * @returns 分页结果
   */
  async getUserList(current: number, size: number) {
    return await userRepository.findUserList(current, size)
  }

  /**
   * 更新用户
   * @param id 用户 ID
   * @param userData 用户数据
   * @returns 更新后的用户
   */
  async update(id: string, userData: Partial<CreateUserData>) {
    // 业务规则：管理员状态必须为 1
    let status = userData.status
    if (userData.isAdmin === true || userData.isAdmin === 1) {
      status = 1
    }

    return await userRepository.update(id, {
      ...userData,
      status
    })
  }

  /**
   * 删除用户
   * @param id 用户 ID
   * @returns 删除的记录数
   */
  async deleteUser(id: string): Promise<number> {
    return await userRepository.deleteById(id)
  }

  /**
   * 检查用户是否存在
   * @param id 用户 ID
   * @returns 是否存在
   */
  async checkUserExists(id: string): Promise<boolean> {
    const user = await userRepository.findById(id)
    return !!user
  }
}

export const userService = new UserService()
