import DataPermission from '@/schema/dataPermission'
import { BaseRepository } from './BaseRepository'

/**
 * 数据权限规则 Repository
 * 处理数据权限规则的 CRUD 操作
 */
class DataPermissionRepository extends BaseRepository<DataPermission> {
  constructor() {
    super(DataPermission)
  }

  /**
   * 根据角色ID获取数据权限规则
   * @param roleId 角色ID
   * @returns 数据权限规则列表
   */
  async findByRoleId(roleId: string): Promise<DataPermission[]> {
    return await this.model.findAll({
      where: { roleId, status: 1 }
    })
  }

  /**
   * 根据角色ID和资源类型获取数据权限规则
   * @param roleId 角色ID
   * @param resourceType 资源类型
   * @returns 数据权限规则
   */
  async findByRoleAndResource(
    roleId: string,
    resourceType: string
  ): Promise<DataPermission | null> {
    return await this.model.findOne({
      where: { roleId, resourceType, status: 1 }
    })
  }

  /**
   * 根据资源类型获取所有数据权限规则
   * @param resourceType 资源类型
   * @returns 数据权限规则列表
   */
  async findByResourceType(resourceType: string): Promise<DataPermission[]> {
    return await this.model.findAll({
      where: { resourceType, status: 1 }
    })
  }

  /**
   * 批量创建数据权限规则
   * @param dataList 数据权限规则列表
   * @returns 创建的数据权限规则
   */
  async batchCreate(
    dataList: Partial<DataPermission>[]
  ): Promise<DataPermission[]> {
    return await this.model.bulkCreate(dataList as any)
  }

  /**
   * 删除角色的所有数据权限规则
   * @param roleId 角色ID
   * @returns 删除的行数
   */
  async deleteByRoleId(roleId: string): Promise<number> {
    return await this.model.destroy({
      where: { roleId }
    })
  }
}

export const dataPermissionRepository = new DataPermissionRepository()
export default DataPermissionRepository
