import { Column, DataType, Default, Table } from 'sequelize-typescript'
import BaseModel from '@/schema/baseModal'

@Table({
  tableName: 'navigation',
  paranoid: true
})
export default class Navigation extends BaseModel {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: '导航名称/标题'
  })
  declare name: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '场景/作用域，如 weapp/mall/store'
  })
  declare scene: string

  @Default(1)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '状态：0-禁用 1-启用'
  })
  declare status: number

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '最后编辑人'
  })
  declare editUser: string

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: '导航配置（JSON），例如 tabbar 项配置'
  })
  declare config: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '描述备注'
  })
  declare description: string
}