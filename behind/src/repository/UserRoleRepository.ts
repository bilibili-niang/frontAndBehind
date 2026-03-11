import { Op } from 'sequelize'
import UserRole from '@/schema/userRole'
import { BaseRepository } from './BaseRepository'

/**
 * 用户角色 Repository
 * 负责用户角色关联的数据访问
 */
export class UserRoleRepository extends BaseRepository<UserRole> {
  constructor() {
    super(UserRole)
  }

  /**
   * 根据用户ID查找角色关联
   * @param userId 用户ID
   * @returns 用户角色关联列表
   */
  async findByUserId(userId: string): Promise<UserRole[]> {
    return await this.model.findAll({ where: { userId } })
  }

  /**
   * 根据角色ID查找用户关联
   * @param roleId 角色ID
   * @returns 用户角色关联列表
   */
  async findByRoleId(roleId: string): Promise<UserRole[]> {
    return await this.model.findAll({ where: { roleId } })
  }

  /**
   * 删除用户的所有角色关联
   * @param userId 用户ID
   * @returns 删除的记录数
   */
  async deleteByUserId(userId: string): Promise<number> {
    return await this.model.destroy({ where: { userId } })
  }

  /**
   * 批量创建用户角色关联
   * @param userId 用户ID
   * @param roleIds 角色ID列表
   * @returns 创建的记录
   */
  async batchCreate(userId: string, roleIds: string[]): Promise<UserRole[]> {
    const records = roleIds.map(roleId => ({
      userId,
      roleId
    }))
    return await this.model.bulkCreate(records as any)
  }
}

export const userRoleRepository = new UserRoleRepository()
