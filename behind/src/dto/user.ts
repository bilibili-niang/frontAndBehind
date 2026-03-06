/**
 * 用户模块 DTO (Data Transfer Object)
 * 定义用户相关的数据传输对象
 */

/**
 * 创建用户请求 DTO
 */
export interface CreateUserDto {
  /** 用户名 */
  userName: string
  /** 密码 */
  password: string
  /** 手机号 */
  phoneNumber?: string
  /** 邮箱 */
  email?: string
  /** 头像 */
  avatar?: string
  /** 性别 */
  gender?: string
  /** 是否管理员 */
  isAdmin?: boolean
  /** 状态 */
  status?: number
  /** 角色ID */
  roleId?: number
}

/**
 * 更新用户请求 DTO
 */
export interface UpdateUserDto {
  /** 用户名 */
  userName?: string
  /** 手机号 */
  phoneNumber?: string
  /** 邮箱 */
  email?: string
  /** 头像 */
  avatar?: string
  /** 性别 */
  gender?: string
  /** 是否管理员 */
  isAdmin?: boolean
  /** 状态 */
  status?: number
  /** 角色ID */
  roleId?: number
}

/**
 * 用户登录请求 DTO
 */
export interface LoginUserDto {
  /** 账号（用户名/手机号） */
  account?: string
  /** 用户名 */
  userName?: string
  /** 手机号 */
  phoneNumber?: string
  /** 密码 */
  password: string
}

/**
 * 用户响应 DTO
 */
export interface UserResponseDto {
  /** 用户ID */
  id: string
  /** 用户名 */
  userName: string
  /** 头像 */
  avatar?: string | null
  /** 手机号 */
  phoneNumber?: string | null
  /** 邮箱 */
  email?: string | null
  /** 性别 */
  gender?: string | null
  /** 是否管理员 */
  isAdmin?: boolean | number
  /** 状态 */
  status?: number
  /** 角色ID */
  roleId?: number
  /** 创建时间 */
  createdAt?: string | Date
  /** 更新时间 */
  updatedAt?: string | Date
}

/**
 * 用户登录响应 DTO
 */
export interface LoginResponseDto {
  /** JWT Token */
  token: string
  /** 用户信息 */
  userInfo: UserResponseDto
}

/**
 * 用户列表查询 DTO
 */
export interface UserListQueryDto {
  /** 当前页 */
  current?: number
  /** 每页大小 */
  size?: number
  /** 用户名关键字 */
  keyword?: string
  /** 状态 */
  status?: number
}

/**
 * 删除用户 DTO
 */
export interface DeleteUserDto {
  /** 用户ID */
  id: string
}
