/**
 * 导航模块类型定义
 */

/**
 * 导航查询参数
 */
export interface NavigationQuery {
  id?: string
  scene?: string
  origin?: string
  name?: string
  status?: number
  size?: number
  page?: number
}

/**
 * 导航路径参数
 */
export interface NavigationParams {
  id?: string
}

/**
 * 创建导航请求体
 */
export interface CreateNavigationBody {
  name: string
  scene: string
  status?: number
  editUser?: string
  config?: string | Record<string, unknown>
  description?: string
}

/**
 * 更新导航请求体
 */
export interface UpdateNavigationBody {
  id?: string
  name?: string
  scene?: string
  status?: number
  editUser?: string
  config?: string | Record<string, unknown>
  description?: string
}

/**
 * 导航配置数据
 */
export interface NavigationData {
  id: string
  name: string
  scene: string
  status?: number
  editUser?: string | null
  config?: string | null
  description?: string | null
  items?: Record<string, unknown>
  createdAt?: Date | string
  updatedAt?: Date | string
}

/**
 * 删除导航结果
 */
export interface DeleteNavigationResult {
  success: boolean
  message?: string
}
