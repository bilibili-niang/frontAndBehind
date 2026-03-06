import { navigationRepository, NavigationData, FindNavigationCriteria } from '@/repository/NavigationRepository'
import { formatDateTime } from '@/utils'
import { Model } from 'sequelize'

/**
 * 导航配置项
 */
export interface NavigationConfig {
  list?: Array<{
    text?: string
    activeText?: string
    [key: string]: any
  }>
  [key: string]: any
}

/**
 * 导航列表项
 */
export interface NavigationListItem {
  id: string
  name: string
  editUser?: string
  createTime: string
  updateTime: string
  status: number
  scene: string
}

/**
 * 导航详情
 */
export interface NavigationDetail {
  id: string
  name: string
  scene: string
  status: number
  editUser?: string
  description?: string
  createTime: string
  updateTime: string
  config: NavigationConfig | null
}

/**
 * 激活的导航数据
 */
export interface ActiveNavigation {
  items: NavigationConfig
}

/**
 * 分页结果
 */
export interface NavigationPaginationResult {
  countId: string
  current: number
  maxLimit: number
  optimizeCountSql: boolean
  orders: any[]
  pages: number
  records: NavigationListItem[]
  searchCount: boolean
  size: number
  total: number
}

/**
 * 导航 Service
 * 处理导航相关的业务逻辑
 */
export class NavigationService {
  /**
   * 规范化底部导航的文案字段
   * 选中时显示 activeText，未选中显示 text
   */
  private normalizeTabLabels(config: NavigationConfig): NavigationConfig {
    if (!config || typeof config !== 'object') return config

    const next: NavigationConfig = { ...config }

    if (Array.isArray(config.list)) {
      next.list = config.list.map((item: Record<string, unknown>) => {
        if (!item || typeof item !== 'object') return item

        const hasText = typeof item.text !== 'undefined' && item.text !== null
        const hasActiveText = typeof item.activeText !== 'undefined' && item.activeText !== null

        // 当两个字段都存在时，不做交换；只在缺失字段时补齐
        if (hasText && hasActiveText) {
          return { ...item }
        }
        if (hasActiveText && !hasText) {
          return { ...item, text: item.activeText, activeText: item.activeText }
        }
        if (hasText && !hasActiveText) {
          return { ...item, activeText: item.text }
        }
        return item
      })
    }

    return next
  }

  /**
   * 解析 config 字段
   */
  private parseConfig(config: string | object | null): NavigationConfig {
    if (!config) return {}

    try {
      if (typeof config === 'string') {
        return JSON.parse(config)
      }
      return config as NavigationConfig
    } catch {
      return {}
    }
  }

  /**
   * 格式化数据为字符串
   */
  private stringifyConfig(config: object | string | undefined): string | undefined {
    if (!config) return undefined
    if (typeof config === 'string') return config
    return JSON.stringify(config)
  }

  /**
   * 获取激活的导航
   * @param scene 场景
   * @returns 激活的导航配置
   */
  async getActiveNavigation(scene: string): Promise<ActiveNavigation> {
    const row = await navigationRepository.findActiveByScene(scene)

    let parsedConfig = this.parseConfig(row?.config as string | object | null)

    // 规范化底部导航的文案字段
    parsedConfig = this.normalizeTabLabels(parsedConfig)

    return { items: parsedConfig }
  }

  /**
   * 创建导航
   * @param data 导航数据
   * @returns 创建的导航
   */
  async create(data: NavigationData) {
    const payload = { ...data }

    // 将 config 对象转为 JSON 字符串
    if (payload.config && typeof payload.config === 'object') {
      payload.config = JSON.stringify(payload.config)
    }

    const res = await navigationRepository.create(payload)

    // 保证同一个 scene 仅有一个激活记录
    if (Number(res.status) === 1 && res.scene) {
      await navigationRepository.deactivateOthersByScene(String(res.scene), String(res.id))
    }

    return res
  }

  /**
   * 更新导航
   * @param id 导航ID
   * @param data 导航数据
   * @returns 更新后的导航
   */
  async update(id: string, data: Partial<NavigationData>) {
    const payload = { ...data }

    // 将 config 对象转为 JSON 字符串
    if (payload.config && typeof payload.config === 'object') {
      payload.config = JSON.stringify(payload.config)
    }

    await navigationRepository.update(id, payload)

    const latest = await navigationRepository.findById(id)

    // 保证同一个 scene 仅有一个激活记录
    const latestScene = latest?.scene ?? data?.scene
    if (latestScene && Number(latest?.status ?? data?.status) === 1) {
      await navigationRepository.deactivateOthersByScene(String(latestScene), id)
    }

    return latest
  }

  /**
   * 删除导航
   * @param id 导航ID
   * @returns 是否删除成功
   */
  async delete(id: string): Promise<{ success: boolean; message?: string }> {
    // 先查询，若状态为启用（使用中）则禁止删除
    const row = await navigationRepository.findById(id)

    if (!row) {
      return { success: false, message: '指定导航不存在' }
    }

    if (Number(row.status) === 1) {
      return { success: false, message: '当前导航处于使用中，无法删除，请先禁用' }
    }

    const count = await navigationRepository.deleteById(id)

    if (count === 0) {
      return { success: false, message: '指定导航不存在' }
    }

    return { success: true }
  }

  /**
   * 获取导航详情
   * @param id 导航ID
   * @returns 导航详情或null
   */
  async getDetail(id: string): Promise<NavigationDetail | null> {
    const row = await navigationRepository.findById(id)

    if (!row) {
      return null
    }

    const plain = typeof row.toJSON === 'function' ? row.toJSON() : row

    return {
      id: plain.id,
      name: plain.name,
      scene: plain.scene,
      status: plain.status,
      editUser: plain.editUser,
      description: plain.description,
      createTime: formatDateTime(plain.createdAt),
      updateTime: formatDateTime(plain.updatedAt),
      config: this.parseConfig(plain.config)
    }
  }

  /**
   * 获取导航列表
   * @param criteria 查询条件
   * @param current 当前页
   * @param size 每页大小
   * @returns 分页结果
   */
  async getList(criteria: FindNavigationCriteria, current: number, size: number): Promise<NavigationPaginationResult> {
    const result = await navigationRepository.findByCriteria(criteria, current, size)

    const pages = Math.ceil(result.total / result.size)

    const records: NavigationListItem[] = result.records.map((row: Model) => {
      const plain = row.toJSON() as NavigationListItem & { createdAt: Date; updatedAt: Date }
      return {
        id: plain.id,
        name: plain.name,
        editUser: plain.editUser,
        createTime: formatDateTime(plain.createdAt),
        updateTime: formatDateTime(plain.updatedAt),
        status: plain.status,
        scene: plain.scene
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

export const navigationService = new NavigationService()
