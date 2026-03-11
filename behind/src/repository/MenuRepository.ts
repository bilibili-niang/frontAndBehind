import { Op } from 'sequelize'
import Menu from '@/schema/menu'
import { BaseRepository } from './BaseRepository'

/**
 * 查找菜单条件
 */
export interface FindMenuCriteria {
  status?: number
  parentId?: string | null
  hidden?: boolean
}

/**
 * 菜单 Repository
 * 负责菜单相关的数据访问
 */
export class MenuRepository extends BaseRepository<Menu> {
  constructor() {
    super(Menu)
  }

  /**
   * 根据条件查找菜单
   * @param criteria 查询条件
   * @returns 菜单列表
   */
  async findByCriteria(criteria: FindMenuCriteria): Promise<Menu[]> {
    const where: any = {}

    if (criteria.status !== undefined) {
      where.status = criteria.status
    }

    if (criteria.parentId !== undefined) {
      where.parentId = criteria.parentId
    }

    if (criteria.hidden !== undefined) {
      where.hidden = criteria.hidden
    }

    return await this.model.findAll({
      where,
      order: [['sort', 'ASC']]
    })
  }

  /**
   * 根据权限标识查找菜单
   * @param permissions 权限标识列表
   * @returns 菜单列表
   */
  async findByPermissions(permissions: string[]): Promise<Menu[]> {
    return await this.model.findAll({
      where: {
        permission: {
          [Op.in]: permissions
        },
        status: 1,
        hidden: false
      },
      order: [['sort', 'ASC']]
    })
  }

  /**
   * 获取所有启用的菜单
   * @returns 菜单列表
   */
  async findAllActive(): Promise<Menu[]> {
    return await this.model.findAll({
      where: {
        status: 1,
        hidden: false
      },
      order: [['sort', 'ASC']]
    })
  }

  /**
   * 根据父菜单ID查找子菜单
   * @param parentId 父菜单ID
   * @returns 子菜单列表
   */
  async findByParentId(parentId: string | null): Promise<Menu[]> {
    return await this.model.findAll({
      where: {
        parentId,
        status: 1
      },
      order: [['sort', 'ASC']]
    })
  }
}

export const menuRepository = new MenuRepository()
