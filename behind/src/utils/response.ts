/**
 * 响应工具函数
 * 提供统一的响应格式构建
 */

/**
 * 基础响应结构
 */
export interface BaseResponse<T = unknown> {
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
 * 成功响应结构
 */
export interface SuccessResponse<T = unknown> extends BaseResponse<T> {
  success: true
}

/**
 * 错误响应结构
 */
export interface ErrorResponse<T = unknown> extends BaseResponse<T> {
  success: false
}

/**
 * 构建成功响应
 * @param data 响应数据
 * @param msg 成功消息
 * @param code 状态码，默认 200
 * @returns 成功响应对象
 */
export function successResponse<T>(data: T, msg = '操作成功', code = 200): SuccessResponse<T> {
  return {
    code,
    success: true,
    msg,
    data
  }
}

/**
 * 构建错误响应
 * @param msg 错误消息
 * @param code 错误码，默认 500
 * @param data 错误数据
 * @returns 错误响应对象
 */
export function errorResponse<T>(msg: string, code = 500, data?: T): ErrorResponse<T | null> {
  return {
    code,
    success: false,
    msg,
    data: data ?? null
  }
}

/**
 * 构建分页成功响应
 * @param list 数据列表
 * @param total 总记录数
 * @param current 当前页码
 * @param size 每页大小
 * @param msg 成功消息
 * @returns 分页响应对象
 */
export function paginationResponse<T>(
  list: T[],
  total: number,
  current: number,
  size: number,
  msg = '查询成功'
): SuccessResponse<{
  countId: string
  current: number
  maxLimit: number
  optimizeCountSql: boolean
  orders: unknown[]
  pages: number
  records: T[]
  searchCount: boolean
  size: number
  total: number
}> {
  const pages = Math.ceil(total / size)

  return {
    code: 200,
    success: true,
    msg,
    data: {
      countId: '',
      current,
      maxLimit: size,
      optimizeCountSql: true,
      orders: [],
      pages,
      records: list,
      searchCount: true,
      size,
      total
    }
  }
}

/**
 * @deprecated 请使用 successResponse 或 errorResponse 替代
 * 通用响应构建函数（向后兼容）
 */
export function ctxBody<T>(requestBody: Partial<BaseResponse<T>>): BaseResponse<T> {
  const defaultResult: BaseResponse<T> = {
    code: 500,
    msg: '响应失败',
    success: false,
    data: {} as T
  }
  return Object.assign(defaultResult, requestBody)
}
