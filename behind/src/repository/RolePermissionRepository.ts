import { Op } from 'sequelize'
import RolePermission from '@/schema/rolePermission'
import { BaseRepository } from './BaseRepository'

/**
 * 角色权限 Repository
 * 负责角色权限关联的数据访问
 */
export class RolePermissionRepository extends BaseRepository<RolePermission> {
  constructor() {
    super(RolePermission)
  }

  /**
   * 根据角色ID查找权限关联
   * @param roleId 角色ID
   * @returns 角色权限关联列表
   */
  async findByRoleId(roleId: string): Promise<RolePermission[]> {
    return await this.model.findAll({ where: { roleId } })
  }

  /**
   * 根据权限ID查找角色关联
   * @param permissionId 权限ID
   * @returns 角色权限关联列表
   */
  async findByPermissionId(permissionId: string): Promise<RolePermission[]> {
    return await this.model.findAll({ where: { permissionId } })
  }

  /**
   * 根据角色ID列表查找权限关联
   * @param roleIds 角色ID列表
   * @returns 角色权限关联列表
   */
  async findByRoleIds(roleIds: string[]): Promise<RolePermission[]> {
    return await this.model.findAll({
      where: {
        roleId: {
          [Op.in]: roleIds
        }
      }
    })
  }

  /**
   * 删除角色的所有权限关联
   * @param roleId 角色ID
   * @returns 删除的记录数
   */
  async deleteByRoleId(roleId: string): Promise<number> {
    return await this.model.destroy({ where: { roleId } })
  }

  /**
   * 批量创建角色权限关联
   * @param roleId 角色ID
   * @param permissionIds 权限ID列表
   * @returns 创建的记录
   */
  async batchCreate(roleId: string, permissionIds: string[]): Promise<RolePermission[]> {
    const records = permissionIds.map(permissionId => ({
      roleId,
      permissionId
    }))
    return await this.model.bulkCreate(records as any)
  }
}

export const rolePermissionRepository = new RolePermissionRepository()
