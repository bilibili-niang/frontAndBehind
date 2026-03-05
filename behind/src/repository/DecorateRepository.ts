import CustomPage from '@/schema/customPage'
import SystemPage from '@/schema/systemPage'
import { BaseRepository } from './BaseRepository'
import { Op, WhereOptions } from 'sequelize'

/**
 * 自定义页面数据
 */
export interface CustomPageData {
  id?: string
  name?: string
  scene?: string
  description?: string
  editUser?: string
  version?: string
  decorate?: string | object
  [key: string]: any
}

/**
 * 系统页面数据
 */
export interface SystemPageData {
  id?: string
  key: string
  scene?: string
  title?: string
  tags?: string
  decorate?: string | object
  origin?: string
  version?: string
  createUser?: string
  updateUser?: string
  isDeleted?: number
  [key: string]: any
}

/**
 * 查询自定义页面条件
 */
export interface FindCustomPageCriteria {
  scene?: string
  name?: string
  onlyDecorated?: boolean
}

/**
 * 自定义页面 Repository
 */
export class CustomPageRepository extends BaseRepository<CustomPage> {
  constructor() {
    super(CustomPage)
  }

  /**
   * 根据条件查询自定义页面列表
   */
  async findByCriteria(criteria: FindCustomPageCriteria, current: number, size: number) {
    const where: WhereOptions = {}

    if (criteria.scene) {
      where.scene = criteria.scene
    }
    if (criteria.name) {
      where.name = { [Op.like]: `%${criteria.name}%` }
    }
    if (criteria.onlyDecorated) {
      where.decorate = { [Op.not]: null }
    }

    return await this.paginate(
      { current, size },
      { where, order: [['updatedAt', 'DESC']] }
    )
  }
}

/**
 * 系统页面 Repository
 */
export class SystemPageRepository extends BaseRepository<SystemPage> {
  constructor() {
    super(SystemPage)
  }

  /**
   * 根据 key 和 scene 查询系统页面
   */
  async findByKeyAndScene(key: string, scene?: string): Promise<SystemPage | null> {
    const where: WhereOptions = { key, isDeleted: 0 }
    if (scene) {
      where.scene = scene
    }

    return await this.model.findOne({
      where,
      order: [['updatedAt', 'DESC']]
    })
  }
}

export const customPageRepository = new CustomPageRepository()
export const systemPageRepository = new SystemPageRepository()
