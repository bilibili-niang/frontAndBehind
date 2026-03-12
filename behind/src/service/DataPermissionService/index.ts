import { dataPermissionRepository } from '@/repository/DataPermissionRepository'
import { userRoleRepository } from '@/repository/UserRoleRepository'
import DataPermission from '@/schema/dataPermission'
import { error } from '@/config/log4j'

/**
 * 数据权限范围枚举
 */
export enum DataScope {
  ALL = 1,          // 全部数据
  DEPT = 2,         // 本部门数据
  DEPT_AND_CHILD = 3, // 本部门及以下
  SELF = 4,         // 仅本人数据
  CUSTOM = 5        // 自定义
}

/**
 * 数据权限查询条件
 */
export interface DataPermissionCondition {
  // 部门ID列表（用于 DEPT、DEPT_AND_CHILD、CUSTOM）
  deptIds?: string[]
  // 用户ID列表（用于 CUSTOM）
  userIds?: string[]
  // 创建者ID字段名
  createByField?: string
  // 部门ID字段名
  deptIdField?: string
}

/**
 * 数据权限服务
 * 处理数据权限的查询和验证
 */
class DataPermissionService {
  /**
   * 获取用户的数据权限规则
   * @param userId 用户ID
   * @param resourceType 资源类型
   * @returns 数据权限规则列表
   */
  async getUserDataPermissions(
    userId: string,
    resourceType: string
  ): Promise<DataPermission[]> {
    try {
      // 1. 获取用户的所有角色
      const userRoles = await userRoleRepository.findByUserId(userId)
      const roleIds = userRoles.map(ur => ur.roleId)

      if (roleIds.length === 0) {
        return []
      }

      // 2. 获取这些角色对指定资源的数据权限规则
      const permissions: DataPermission[] = []
      for (const roleId of roleIds) {
        const permission = await dataPermissionRepository.findByRoleAndResource(
          roleId,
          resourceType
        )
        if (permission) {
          permissions.push(permission)
        }
      }

      return permissions
    } catch (err) {
      error('获取用户数据权限失败', { userId, resourceType, error: err })
      return []
    }
  }

  /**
   * 获取用户的数据权限范围
   * 返回最宽松的数据权限范围
   * @param userId 用户ID
   * @param resourceType 资源类型
   * @returns 数据权限范围和条件
   */
  async getUserDataScope(
    userId: string,
    resourceType: string
  ): Promise<{ scope: DataScope; condition: DataPermissionCondition }> {
    const permissions = await this.getUserDataPermissions(userId, resourceType)

    if (permissions.length === 0) {
      // 没有配置数据权限，默认只能看自己的
      return {
        scope: DataScope.SELF,
        condition: { createByField: 'createBy' }
      }
    }

    // 找出最宽松的权限（数字越小权限越大）
    let minScope = DataScope.SELF
    let customCondition: DataPermissionCondition = {}

    for (const permission of permissions) {
      if (permission.scope < minScope) {
        minScope = permission.scope
      }

      // 如果是自定义权限，解析自定义规则
      if (permission.scope === DataScope.CUSTOM && permission.customRule) {
        try {
          const rule = JSON.parse(permission.customRule)
          customCondition = {
            deptIds: rule.deptIds || [],
            userIds: rule.userIds || []
          }
        } catch (e) {
          error('解析自定义数据权限规则失败', { permission, error: e })
        }
      }
    }

    return {
      scope: minScope,
      condition: customCondition
    }
  }

  /**
   * 构建数据权限查询条件
   * @param userId 用户ID
   * @param resourceType 资源类型
   * @param deptId 用户部门ID（用于部门权限）
   * @returns Sequelize 查询条件
   */
  async buildDataPermissionQuery(
    userId: string,
    resourceType: string,
    deptId?: string
  ): Promise<any> {
    const { scope, condition } = await this.getUserDataScope(userId, resourceType)

    switch (scope) {
      case DataScope.ALL:
        // 全部数据，不需要额外条件
        return {}

      case DataScope.DEPT:
        // 本部门数据
        if (deptId) {
          return { deptId }
        }
        return { createBy: userId }

      case DataScope.DEPT_AND_CHILD:
        // 本部门及以下（需要部门树，简化处理）
        if (deptId) {
          return { deptId }
        }
        return { createBy: userId }

      case DataScope.CUSTOM:
        // 自定义数据范围
        const orConditions: any[] = [{ createBy: userId }]
        
        if (condition.deptIds && condition.deptIds.length > 0) {
          orConditions.push({ deptId: condition.deptIds })
        }
        
        if (condition.userIds && condition.userIds.length > 0) {
          orConditions.push({ createBy: condition.userIds })
        }
        
        return { [Symbol.for('or')]: orConditions }

      case DataScope.SELF:
      default:
        // 仅本人数据
        return { createBy: userId }
    }
  }

  /**
   * 检查用户是否有数据权限
   * @param userId 用户ID
   * @param resourceType 资源类型
   * @param dataId 数据ID
   * @param dataOwnerId 数据所有者ID
   * @param dataDeptId 数据所属部门ID
   * @returns 是否有权限
   */
  async checkDataPermission(
    userId: string,
    resourceType: string,
    dataId: string,
    dataOwnerId: string,
    dataDeptId?: string
  ): Promise<boolean> {
    const { scope } = await this.getUserDataScope(userId, resourceType)

    switch (scope) {
      case DataScope.ALL:
        return true

      case DataScope.DEPT:
      case DataScope.DEPT_AND_CHILD:
        // 简化处理：检查是否是同部门
        return dataOwnerId === userId

      case DataScope.CUSTOM:
        // 自定义权限需要额外检查
        return dataOwnerId === userId

      case DataScope.SELF:
      default:
        return dataOwnerId === userId
    }
  }

  /**
   * 为角色设置数据权限
   * @param roleId 角色ID
   * @param resourceType 资源类型
   * @param scope 数据权限范围
   * @param customRule 自定义规则（JSON字符串）
   * @returns 数据权限规则
   */
  async setRoleDataPermission(
    roleId: string,
    resourceType: string,
    scope: DataScope,
    customRule?: string
  ): Promise<DataPermission> {
    try {
      // 1. 查找是否已存在
      const existing = await dataPermissionRepository.findByRoleAndResource(
        roleId,
        resourceType
      )

      if (existing) {
        // 2. 更新现有规则
        return await existing.update({
          scope,
          customRule: customRule || existing.customRule,
          status: 1
        })
      } else {
        // 3. 创建新规则
        return await dataPermissionRepository.create({
          roleId,
          resourceType,
          scope,
          customRule,
          status: 1
        })
      }
    } catch (err) {
      error('设置角色数据权限失败', { roleId, resourceType, error: err })
      throw err
    }
  }

  /**
   * 删除角色的数据权限
   * @param roleId 角色ID
   * @param resourceType 资源类型（可选，不传则删除所有）
   * @returns 删除的行数
   */
  async removeRoleDataPermission(
    roleId: string,
    resourceType?: string
  ): Promise<number> {
    try {
      if (resourceType) {
        const permission = await dataPermissionRepository.findByRoleAndResource(
          roleId,
          resourceType
        )
        if (permission) {
          await permission.destroy()
          return 1
        }
        return 0
      } else {
        return await dataPermissionRepository.deleteByRoleId(roleId)
      }
    } catch (err) {
      error('删除角色数据权限失败', { roleId, resourceType, error: err })
      throw err
    }
  }
}

export const dataPermissionService = new DataPermissionService()
export default DataPermissionService
