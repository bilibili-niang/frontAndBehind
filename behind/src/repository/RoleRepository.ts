import { Op } from 'sequelize'
import Role from '@/schema/role'
import { BaseRepository } from './BaseRepository'

/**
 * 查找角色条件
 */
export interface FindRoleCriteria {
  name?: string
  status?: number
}

/**
 * 角色 Repository
 * 负责角色相关的数据访问
 */
export class RoleRepository extends BaseRepository<Role> {
  constructor() {
    super(Role)
  }

  /**
   * 根据条件查找角色
   * @param criteria 查询条件
   * @returns 角色列表
   */
  async findByCriteria(criteria: FindRoleCriteria): Promise<Role[]> {
    const where: any = {}

    if (criteria.name) {
      where.name = criteria.name
    }

    if (criteria.status !== undefined) {
      where.status = criteria.status
    }

    return await this.model.findAll({ where })
  }

  /**
   * 根据名称查找角色
   * @param name 角色名称
   * @returns 角色实例或 null
   */
  async findByName(name: string): Promise<Role | null> {
    return await this.model.findOne({ where: { name } })
  }

  /**
   * 获取默认角色
   * @returns 默认角色或 null
   */
  async findDefaultRole(): Promise<Role | null> {
    return await this.model.findOne({ where: { isDefault: true } })
  }
}

export const roleRepository = new RoleRepository()
