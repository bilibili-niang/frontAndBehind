import SystemPage from '@/schema/systemPage'
import { BaseRepository } from './BaseRepository'
import { Op, WhereOptions } from 'sequelize'

/**
 * 系统页面数据
 */
export interface SystemPageData {
  id?: string
  scene?: string
  key?: string
  title?: string
  name?: string
  tags?: string
  decorate?: string | object
  config?: string | object
  origin?: number
  version?: string
  tenantId?: string
  editUser?: string
  description?: string
  createUser?: string
  updateUser?: string
  isDeleted?: number
  isProtected?: number
  [key: string]: any
}

/**
 * 查询系统页面条件
 */
export interface FindSystemPageCriteria {
  scene?: string
  name?: string
}

/**
 * 系统页面 Repository
 */
export class SystemPageRepository extends BaseRepository<SystemPage> {
  constructor() {
    super(SystemPage)
  }

  /**
   * 根据条件查询系统页面列表
   */
  async findByCriteria(criteria: FindSystemPageCriteria, current: number, size: number) {
    const where: WhereOptions = {}

    if (criteria.name) {
      where.name = { [Op.like]: `%${criteria.name}%` }
    }
    if (criteria.scene) {
      where.scene = criteria.scene
    }

    return await this.paginate(
      { current, size },
      { where, order: [['updatedAt', 'DESC']] }
    )
  }

  /**
   * 检查页面是否受保护
   */
  async isProtected(id: string): Promise<boolean> {
    const row = await this.findById(id)
    return row ? Number(row.isProtected) === 1 : false
  }
}

export const systemPageRepository = new SystemPageRepository()
