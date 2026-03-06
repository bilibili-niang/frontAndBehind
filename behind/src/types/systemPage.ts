/**
 * 系统页面模块类型定义
 */

import { Context } from 'koa'

/**
 * Koa Context 扩展类型
 */
export interface TypedContext<TBody = unknown, TQuery = unknown, TParams = unknown> extends Context {
  parsed: {
    body: TBody
    query: TQuery
  }
  params: TParams
}

/**
 * 创建系统页面请求体
 */
export interface CreateSystemPageBody {
  scene: string
  key?: string
  title: string
  tags?: string
  decorate?: string | Record<string, unknown>
  origin?: number
  version?: string
  tenantId?: string
  editUser?: string
  description?: string
  createUser?: string
}

/**
 * 更新系统页面请求体
 */
export interface UpdateSystemPageBody {
  id?: string
  scene?: string
  key?: string
  title?: string
  tags?: string
  decorate?: string | Record<string, unknown>
  origin?: number
  version?: string
  tenantId?: string
  editUser?: string
  description?: string
  updateUser?: string
}

/**
 * 系统页面查询参数
 */
export interface SystemPageQuery {
  id?: string
  scene?: string
  name?: string
  size?: number
  page?: number
}

/**
 * 系统页面路径参数
 */
export interface SystemPageParams {
  id?: string
}

/**
 * 系统页面数据
 */
export interface SystemPageData {
  id: string
  scene: string
  key?: string | null
  title: string
  tags?: string | null
  decorate?: string | null
  origin?: number | null
  version?: string | null
  tenantId?: string | null
  editUser?: string | null
  description?: string | null
  createUser?: string | null
  updateUser?: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
}

/**
 * 删除结果
 */
export interface DeleteResult {
  success: boolean
  msg: string
}
