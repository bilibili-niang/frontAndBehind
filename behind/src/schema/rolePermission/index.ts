import { Column, DataType, ForeignKey, Table } from 'sequelize-typescript'
import BaseModel from '@/schema/baseModel'
import Role from '@/schema/role'
import Permission from '@/schema/permission'

/**
 * 角色权限关联模型
 * 用于建立角色和权限的多对多关系
 */
@Table({
  tableName: 'role_permissions',
  paranoid: false,
  comment: '角色权限关联表'
})
export default class RolePermission extends BaseModel {
  @ForeignKey(() => Role)
  @Column({
    type: DataType.STRING(36),
    allowNull: false,
    comment: '角色ID'
  })
  declare roleId: string

  @ForeignKey(() => Permission)
  @Column({
    type: DataType.STRING(36),
    allowNull: false,
    comment: '权限ID'
  })
  declare permissionId: string
}
