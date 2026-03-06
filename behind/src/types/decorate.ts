/**
 * 装修模块类型定义
 */

/**
 * 装修查询参数
 */
export interface DecorateQuery {
  key?: string
  scene?: string
  name?: string
  id?: string
  onlyDecorated?: boolean
  size?: number
  page?: number
}

/**
 * 装修路径参数
 */
export interface DecorateParams {
  id?: string
}

/**
 * 创建自定义页面请求体
 */
export interface CreateDecorateBody {
  scene: string
  title: string
  description?: string
  editUser?: string
  version?: string
  decorate?: string | Record<string, unknown>
}

/**
 * 更新自定义页面请求体
 */
export interface UpdateDecorateBody {
  title?: string
  description?: string
  editUser?: string
  version?: string
  decorate?: string | Record<string, unknown>
}

/**
 * 自定义页面列表查询条件
 */
export interface CustomizeListCriteria {
  scene?: string
  name?: string
  onlyDecorated?: boolean
}

/**
 * 装修页面数据
 */
export interface DecorateData {
  id: string
  scene: string
  title: string
  description?: string | null
  editUser?: string | null
  version?: string | null
  decorate?: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
}
