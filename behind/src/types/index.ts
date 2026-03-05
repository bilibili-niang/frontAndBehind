import { Context } from 'koa'
import User from '@/schema/user'

/**
 * JWT 载荷类型定义
 */
export interface JWTPayload {
  /** 用户ID */
  id: string
  /** 用户名 */
  userName?: string
  /** 用户头像 */
  avatar?: string
  /** 手机号 */
  phoneNumber?: string
  /** 邮箱 */
  email?: string
  /** 性别 */
  gender?: string
  /** 是否管理员 */
  isAdmin?: boolean
  /** 状态 */
  status?: number
  /** 角色ID */
  roleId?: number
  /** 签发时间 */
  iat?: number
  /** 过期时间 */
  exp?: number
}

/**
 * 扩展的 Koa 上下文类型
 * 包含 decode 和 user 属性
 */
export interface KoaContextWithUser extends Context {
  /** JWT 解码后的载荷 */
  decode?: JWTPayload
  /** 当前用户信息 */
  user?: User
}

/**
 * 通用响应数据类型
 */
export interface ResponseData<T = unknown> {
  /** 状态码 */
  code: number
  /** 是否成功 */
  success: boolean
  /** 消息 */
  msg: string
  /** 数据 */
  data: T
}

/**
 * 分页查询参数
 */
export interface PaginationQuery {
  /** 当前页码 */
  pageNum?: number
  /** 每页条数 */
  pageSize?: number
}

/**
 * 分页响应数据
 */
export interface PaginationData<T> {
  /** 数据列表 */
  list: T[]
  /** 总条数 */
  total: number
  /** 当前页码 */
  pageNum: number
  /** 每页条数 */
  pageSize: number
}

/**
 * 用户信息（不含敏感字段）
 */
export interface UserInfo {
  id: string
  userName: string
  avatar?: string
  phoneNumber?: string
  email?: string
  gender?: string
  isAdmin?: boolean
  status?: number
  createdAt?: Date
  updatedAt?: Date
}
