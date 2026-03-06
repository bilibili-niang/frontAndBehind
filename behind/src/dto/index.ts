/**
 * DTO (Data Transfer Object) 层
 * 统一导出所有数据传输对象
 */

// 用户模块 DTO
export * from './user'

/**
 * 通用响应 DTO
 */
export interface BaseResponseDto<T = unknown> {
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
 * 分页响应 DTO
 */
export interface PaginationResponseDto<T> {
  /** 计数ID */
  countId: string
  /** 当前页码 */
  current: number
  /** 最大限制 */
  maxLimit: number
  /** 是否优化计数SQL */
  optimizeCountSql: boolean
  /** 排序 */
  orders: unknown[]
  /** 总页数 */
  pages: number
  /** 数据记录 */
  records: T[]
  /** 是否搜索计数 */
  searchCount: boolean
  /** 每页大小 */
  size: number
  /** 总记录数 */
  total: number
}
