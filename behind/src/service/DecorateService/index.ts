import {
  customPageRepository,
  systemPageRepository,
  CustomPageData,
  SystemPageData,
  FindCustomPageCriteria
} from '@/repository/DecorateRepository'
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
  key: string
  title?: string
  tags?: string
  decorate: DecorateConfig | null
  origin?: string
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
 * 自定义页面列表项
 */
export interface CustomPageListItem {
  id: string
  name: string
  scene?: string
  editUser?: string
  description?: string
  title: string
  version?: string
  createTime: string
  updateTime: string
}

/**
 * 自定义页面详情
 */
export interface CustomPageDetail {
  id: string
  name: string
  scene?: string
  editUser?: string
  description?: string
  title: string
  version?: string
  decorate: DecorateConfig | null
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
  records: CustomPageListItem[]
  searchCount: boolean
  size: number
  total: number
}

/**
 * 装修 Service
 * 处理装修相关的业务逻辑
 */
export class DecorateService {
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
   * 获取系统页面详情
   * @param key 页面key
   * @param scene 场景
   * @returns 系统页面详情或null
   */
  async getSystemPageDetail(key: string, scene?: string): Promise<SystemPageDetail | null> {
    const row = await systemPageRepository.findByKeyAndScene(key, scene)

    if (!row) {
      return null
    }

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
   * 获取自定义页面列表
   * @param criteria 查询条件
   * @param current 当前页
   * @param size 每页大小
   * @returns 分页结果
   */
  async getCustomPageList(criteria: FindCustomPageCriteria, current: number, size: number): Promise<PaginationResult> {
    const result = await customPageRepository.findByCriteria(criteria, current, size)

    const pages = Math.ceil(result.total / result.size)

    const records: CustomPageListItem[] = result.records.map((row: any) => {
      const plain = typeof row.toJSON === 'function' ? row.toJSON() : row
      return {
        id: plain.id,
        name: plain.name,
        scene: plain.scene,
        editUser: plain.editUser,
        description: plain.description,
        title: plain.name,
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

  /**
   * 创建自定义页面
   * @param data 页面数据
   * @returns 创建的页面ID
   */
  async createCustomPage(data: {
    scene: string
    title: string
    description?: string
    editUser?: string
    version?: string
    decorate?: object | string
  }): Promise<{ id: string }> {
    const payload: CustomPageData = {
      name: data.title,
      scene: data.scene,
      description: data.description || null,
      editUser: data.editUser || null,
      version: data.version || null
    }

    if (data.decorate) {
      payload.decorate = this.stringifyDecorate(data.decorate)
    }

    const created = await customPageRepository.create(payload)
    return { id: created.id }
  }

  /**
   * 更新自定义页面
   * @param id 页面ID
   * @param data 页面数据
   * @returns 是否更新成功
   */
  async updateCustomPage(id: string, data: {
    title?: string
    description?: string
    editUser?: string
    version?: string
    decorate?: object | string
  }): Promise<boolean> {
    const updates: CustomPageData = {}

    if (data.title) updates.name = data.title
    if (data.description !== undefined) updates.description = data.description
    if (data.editUser !== undefined) updates.editUser = data.editUser
    if (data.version !== undefined) updates.version = data.version
    if (data.decorate !== undefined) {
      updates.decorate = this.stringifyDecorate(data.decorate)
    }

    const count = await customPageRepository.update(id, updates)
    return count > 0
  }

  /**
   * 获取自定义页面详情
   * @param id 页面ID
   * @returns 页面详情或null
   */
  async getCustomPageDetail(id: string): Promise<CustomPageDetail | null> {
    const row = await customPageRepository.findById(id)

    if (!row) {
      return null
    }

    const plain = typeof row.toJSON === 'function' ? row.toJSON() : row

    return {
      id: plain.id,
      name: plain.name,
      scene: plain.scene,
      editUser: plain.editUser,
      description: plain.description,
      title: plain.name,
      version: plain.version,
      decorate: this.parseDecorate(plain.decorate),
      createTime: formatDateTime(plain.createdAt),
      updateTime: formatDateTime(plain.updatedAt)
    }
  }

  /**
   * 删除自定义页面
   * @param id 页面ID
   * @returns 是否删除成功
   */
  async deleteCustomPage(id: string): Promise<boolean> {
    const count = await customPageRepository.deleteById(id)
    return count > 0
  }
}

export const decorateService = new DecorateService()
