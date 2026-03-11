import { Column, DataType, Default, Table } from 'sequelize-typescript'
import BaseModel from '@/schema/baseModel'

/**
 * 菜单模型
 * 用于定义系统的菜单结构
 */
@Table({
  tableName: 'menus',
  paranoid: true,
  comment: '菜单表'
})
export default class Menu extends BaseModel {
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: '菜单名称'
  })
  declare name: string

  @Column({
    type: DataType.STRING(200),
    comment: '路由路径'
  })
  declare path: string

  @Column({
    type: DataType.STRING(200),
    comment: '组件路径'
  })
  declare component: string

  @Column({
    type: DataType.STRING(50),
    comment: '图标'
  })
  declare icon: string

  @Column({
    type: DataType.STRING(100),
    comment: '关联权限标识'
  })
  declare permission: string

  @Column({
    type: DataType.STRING(36),
    comment: '父菜单ID'
  })
  declare parentId: string

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: '排序'
  })
  declare sort: number

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    comment: '是否隐藏'
  })
  declare hidden: boolean

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    comment: '是否缓存'
  })
  declare keepAlive: boolean

  @Default(1)
  @Column({
    type: DataType.TINYINT,
    comment: '状态：0-禁用 1-启用'
  })
  declare status: number
}
