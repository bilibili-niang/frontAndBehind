import { Column, DataType, Default, Table } from 'sequelize-typescript'
import BaseModel from '@/schema/baseModel'

/**
 * 角色模型
 * 用于定义系统中的角色，如管理员、普通用户等
 */
@Table({
  tableName: 'roles',
  paranoid: true,
  comment: '角色表'
})
export default class Role extends BaseModel {
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
    comment: '角色名称（英文标识）'
  })
  declare name: string

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: '角色显示名称'
  })
  declare displayName: string

  @Column({
    type: DataType.STRING(255),
    comment: '角色描述'
  })
  declare description: string

  @Default(1)
  @Column({
    type: DataType.TINYINT,
    comment: '状态：0-禁用 1-启用'
  })
  declare status: number

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    comment: '是否默认角色'
  })
  declare isDefault: boolean

  @Default(1)
  @Column({
    type: DataType.TINYINT,
    comment: '数据权限范围：1-全部 2-本部门 3-本人'
  })
  declare dataScope: number
}
