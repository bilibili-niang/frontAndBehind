import { Op } from 'sequelize'
import Permission from '@/schema/permission'
import { BaseRepository } from './BaseRepository'

/**
 * 查找权限条件
 */
export interface FindPermissionCriteria {
  type?: string
  resource?: string
  status?: number
}

/**
 * 权限 Repository
 * 负责权限相关的数据访问
 */
export class PermissionRepository extends BaseRepository<Permission> {
  constructor() {
    super(Permission)
  }

  /**
   * 根据条件查找权限
   * @param criteria 查询条件
   * @returns 权限列表
   */
  async findByCriteria(criteria: FindPermissionCriteria): Promise<Permission[]> {
    const where: any = {}

    if (criteria.type) {
      where.type = criteria.type
    }

    if (criteria.resource) {
      where.resource = criteria.resource
    }

    if (criteria.status !== undefined) {
      where.status = criteria.status
    }

    return await this.model.findAll({
      where,
      order: [['sort', 'ASC']]
    })
  }

  /**
   * 根据名称查找权限
   * @param name 权限名称
   * @returns 权限实例或 null
   */
  async findByName(name: string): Promise<Permission | null> {
    return await this.model.findOne({ where: { name } })
  }

  /**
   * 根据ID列表查找权限
   * @param ids 权限ID列表
   * @returns 权限列表
   */
  async findByIds(ids: string[]): Promise<Permission[]> {
    return await this.model.findAll({
      where: {
        id: {
          [Op.in]: ids
        }
      }
    })
  }

  /**
   * 根据权限标识列表查找权限
   * @param names 权限标识列表
   * @returns 权限列表
   */
  async findByNames(names: string[]): Promise<Permission[]> {
    return await this.model.findAll({
      where: {
        name: {
          [Op.in]: names
        }
      }
    })
  }
}

export const permissionRepository = new PermissionRepository()
