import {
  systemPageRepository,
  SystemPageData,
  FindSystemPageCriteria
} from '@/repository/SystemPageRepository'
import { formatDateTime } from '@/utils'

/**
 * 装修配置
 */
export interface DecorateConfig {
  [key: string]: any
}

/**
 * 系统页面详情
 */
export interface SystemPageDetail {
  id: string
  tenantId?: string
  key?: string
  title?: string
  tags?: string
  decorate: DecorateConfig | null
  origin?: number
  version?: string
  createUser?: string
  updateUser?: string
  createTime: string
  updateTime: string
  isDeleted: number
  name?: string
  scene?: string
  editUser?: string
  description?: string
}

/**
 * 系统页面列表项
 */
export interface SystemPageListItem {
  id: string
  name?: string
  scene?: string
  editUser?: string
  description?: string
  key?: string
  title?: string
  version?: string
  createTime: string
  updateTime: string
}

/**
 * 分页结果
 */
export interface PaginationResult {
  countId: string
  current: number
  maxLimit: number
  optimizeCountSql: boolean
  orders: any[]
  pages: number
  records: SystemPageListItem[]
  searchCount: boolean
  size: number
  total: number
}

/**
 * 系统页面 Service
 * 处理系统页面相关的业务逻辑
 */
export class SystemPageService {
  /**
   * 解析装修配置
   */
  private parseDecorate(decorate: string | object | null | undefined): DecorateConfig | null {
    if (!decorate) return null

    try {
      if (typeof decorate === 'string') {
        return JSON.parse(decorate)
      }
      return decorate as DecorateConfig
    } catch {
      return null
    }
  }

  /**
   * 格式化装修配置为字符串
   */
  private stringifyDecorate(decorate: object | string | undefined): string | undefined {
    if (!decorate) return undefined
    if (typeof decorate === 'string') return decorate
    return JSON.stringify(decorate)
  }

  /**
   * 格式化系统页面数据为详情对象
   */
  private formatPageDetail(row: any): SystemPageDetail {
    const plain = typeof row.toJSON === 'function' ? row.toJSON() : row

    return {
      id: plain.id,
      tenantId: plain.tenantId,
      key: plain.key,
      title: plain.title,
      tags: plain.tags,
      decorate: this.parseDecorate(plain.decorate),
      origin: plain.origin,
      version: plain.version,
      createUser: plain.createUser,
      updateUser: plain.updateUser,
      createTime: formatDateTime(plain.createdAt),
      updateTime: formatDateTime(plain.updatedAt),
      isDeleted: plain.isDeleted,
      name: plain.name,
      scene: plain.scene,
      editUser: plain.editUser,
      description: plain.description
    }
  }

  /**
   * 创建系统页面
   * @param data 页面数据
   * @returns 创建的页面详情
   */
  async createSystemPage(data: {
    scene: string
    key?: string
    title: string
    tags?: string
    decorate?: object | string
    config?: object | string
    origin?: number
    version?: string
    tenantId?: string
    editUser?: string
    description?: string
    createUser?: string
  }): Promise<SystemPageDetail> {
    const payload: SystemPageData = {
      ...data,
      name: data.title ?? data.name,
      isDeleted: 0
    }

    // 序列化对象字段
    if (data.decorate && typeof data.decorate === 'object') {
      payload.decorate = JSON.stringify(data.decorate)
    }
    if (data.config && typeof data.config === 'object') {
      payload.config = JSON.stringify(data.config)
    }

    const created = await systemPageRepository.create(payload)
    return this.formatPageDetail(created)
  }

  /**
   * 更新系统页面
   * @param id 页面ID
   * @param data 页面数据
   * @returns 更新后的页面详情或null
   */
  async updateSystemPage(id: string, data: {
    scene?: string
    key?: string
    title?: string
    tags?: string
    decorate?: object | string
    config?: object | string
    origin?: number
    version?: string
    tenantId?: string
    editUser?: string
    description?: string
    updateUser?: string
  }): Promise<SystemPageDetail | null> {
    const payload: SystemPageData = { ...data }

    // 保持 name 与 title 一致
    if (data.title && !data.name) {
      payload.name = data.title
    }

    // 序列化对象字段
    if (data.decorate && typeof data.decorate === 'object') {
      payload.decorate = JSON.stringify(data.decorate)
    }
    if (data.config && typeof data.config === 'object') {
      payload.config = JSON.stringify(data.config)
    }

    const count = await systemPageRepository.update(id, payload)
    if (count === 0) {
      return null
    }

    const updated = await systemPageRepository.findById(id)
    if (!updated) {
      return null
    }

    return this.formatPageDetail(updated)
  }

  /**
   * 删除系统页面（软删除）
   * @param id 页面ID
   * @returns 是否删除成功
   */
  async deleteSystemPage(id: string): Promise<{ success: boolean; msg?: string }> {
    // 检查页面是否存在
    const row = await systemPageRepository.findById(id)
    if (!row) {
      return { success: false, msg: '指定页面不存在' }
    }

    // 检查是否受保护
    if (Number(row.isProtected) === 1) {
      return { success: false, msg: '系统默认页面不可删除' }
    }

    // 软删除并标记 isDeleted
    await systemPageRepository.update(id, { isDeleted: 1 })
    const count = await systemPageRepository.deleteById(id)

    return { success: count > 0 }
  }

  /**
   * 获取系统页面详情
   * @param id 页面ID
   * @returns 页面详情或null
   */
  async getSystemPageDetail(id: string): Promise<SystemPageDetail | null> {
    const row = await systemPageRepository.findById(id)
    if (!row) {
      return null
    }

    return this.formatPageDetail(row)
  }

  /**
   * 获取系统页面列表
   * @param criteria 查询条件
   * @param current 当前页
   * @param size 每页大小
   * @returns 分页结果
   */
  async getSystemPageList(criteria: FindSystemPageCriteria, current: number, size: number): Promise<PaginationResult> {
    const result = await systemPageRepository.findByCriteria(criteria, current, size)

    const pages = Math.ceil(result.total / result.size)

    const records: SystemPageListItem[] = result.records.map((row: any) => {
      const plain = typeof row.toJSON === 'function' ? row.toJSON() : row
      return {
        id: plain.id,
        name: plain.name,
        scene: plain.scene,
        editUser: plain.editUser,
        description: plain.description,
        key: plain.key,
        title: plain.title,
        version: plain.version,
        createTime: formatDateTime(plain.createdAt),
        updateTime: formatDateTime(plain.updatedAt)
      }
    })

    return {
      countId: '',
      current: result.current,
      maxLimit: result.size,
      optimizeCountSql: true,
      orders: [],
      pages,
      records,
      searchCount: true,
      size: result.size,
      total: result.total
    }
  }
}

export const systemPageService = new SystemPageService()
