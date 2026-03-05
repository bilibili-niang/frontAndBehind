/**
 * 通用类型定义
 * 存放项目中多处使用的通用类型
 */

/**
 * 分页查询参数
 */
export interface PaginationOptions {
  /** 当前页码 */
  current: number
  /** 每页大小 */
  size: number
}

/**
 * 分页查询参数（可选）
 */
export interface PaginationQuery {
  /** 当前页码 */
  current?: number
  /** 每页大小 */
  size?: number
  /** 页码（兼容字段） */
  page?: number
}

/**
 * 分页响应结果
 */
export interface PaginationResult<T> {
  /** 数据列表 */
  records: T[]
  /** 总记录数 */
  total: number
  /** 当前页码 */
  current: number
  /** 每页大小 */
  size: number
  /** 总页数 */
  pages: number
}

/**
 * 标准分页响应（兼容前端框架）
 */
export interface StandardPaginationResult<T> {
  /** 计数ID */
  countId: string
  /** 当前页码 */
  current: number
  /** 最大限制 */
  maxLimit: number
  /** 是否优化计数SQL */
  optimizeCountSql: boolean
  /** 排序 */
  orders: any[]
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

/**
 * 通用查询条件
 */
export interface CommonCriteria {
  [key: string]: unknown
}

/**
 * 时间范围查询
 */
export interface DateRangeQuery {
  /** 开始时间 */
  startTime?: string
  /** 结束时间 */
  endTime?: string
}

/**
 * 排序字段
 */
export interface SortField {
  /** 字段名 */
  field: string
  /** 排序方向 */
  order: 'asc' | 'desc'
}

/**
 * 操作结果
 */
export interface OperationResult<T = unknown> {
  /** 是否成功 */
  success: boolean
  /** 数据 */
  data: T
  /** 消息 */
  message?: string
}

/**
 * ID 参数
 */
export interface IdParam {
  id: string
}

/**
 * 批量 ID 参数
 */
export interface BatchIdsParam {
  ids: string[]
}

/**
 * 状态枚举
 */
export enum Status {
  DISABLED = 0,
  ENABLED = 1
}

/**
 * 性别枚举
 */
export enum Gender {
  MALE = '男',
  FEMALE = '女',
  UNKNOWN = '保密'
}
