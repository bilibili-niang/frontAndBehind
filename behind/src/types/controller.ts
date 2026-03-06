/**
 * Controller 层通用类型定义
 */

import { Context } from 'koa'

/**
 * 扩展的 Koa Context 类型
 * 包含 parsed 属性（由 koa-swagger-decorator 提供）
 */
export interface ExtendedContext extends Context {
  parsed?: {
    body?: unknown
    query?: Record<string, unknown>
  }
}

/**
 * 通用分页查询参数
 */
export interface PaginationQuery {
  current?: number
  page?: number
  size?: number
  keyword?: string
}

/**
 * 通用 ID 参数
 */
export interface IdParams {
  id?: string
}

/**
 * 通用 ID 查询
 */
export interface IdQuery {
  id?: string
}

/**
 * 通用操作结果
 */
export interface OperationResult {
  success: boolean
  msg: string
  data?: unknown
}

/**
 * 错误处理类型
 */
export type ErrorType = Error | unknown

/**
 * 获取错误消息
 * @param error 错误对象
 * @returns 错误消息字符串
 */
export function getErrorMessage(error: ErrorType): string {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}
