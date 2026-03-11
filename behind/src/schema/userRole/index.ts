import { Column, DataType, ForeignKey, Table } from 'sequelize-typescript'
import BaseModel from '@/schema/baseModel'
import User from '@/schema/user'
import Role from '@/schema/role'

/**
 * 用户角色关联模型
 * 用于建立用户和角色的多对多关系
 */
@Table({
  tableName: 'user_roles',
  paranoid: false,
  comment: '用户角色关联表'
})
export default class UserRole extends BaseModel {
  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING(36),
    allowNull: false,
    comment: '用户ID'
  })
  declare userId: string

  @ForeignKey(() => Role)
  @Column({
    type: DataType.STRING(36),
    allowNull: false,
    comment: '角色ID'
  })
  declare roleId: string
}
