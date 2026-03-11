import { Column, DataType, Default, Table } from 'sequelize-typescript'
import BaseModel from '@/schema/baseModel'

/**
 * 权限模型
 * 用于定义系统中的权限，支持菜单、按钮、API、数据等类型
 */
@Table({
  tableName: 'permissions',
  paranoid: true,
  comment: '权限表'
})
export default class Permission extends BaseModel {
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
    comment: '权限名称（英文标识）'
  })
  declare name: string

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: '权限显示名称'
  })
  declare displayName: string

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    comment: '权限类型：menu/button/api/data'
  })
  declare type: string

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    comment: '资源标识'
  })
  declare resource: string

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    comment: '操作：view/create/update/delete'
  })
  declare action: string

  @Column({
    type: DataType.STRING(36),
    comment: '父权限ID'
  })
  declare parentId: string

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: '排序'
  })
  declare sort: number

  @Default(1)
  @Column({
    type: DataType.TINYINT,
    comment: '状态：0-禁用 1-启用'
  })
  declare status: number
}
