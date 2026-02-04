import { Column, DataType, Length, Table } from 'sequelize-typescript'
import BaseModel from '@/schema/baseModal'

@Table({
  tableName: 'authority',
  paranoid: true
  // 启用软删除
})

export default class Authority extends BaseModel {

  @Length({
    min: 1,
    max: 10,
    msg: 'roleName must between 1 to 10 characters'
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: '角色名称必须要填的'
  })
  declare roleName: string

  @Length({
    min: 1,
    max: 30,
    msg: '描述不能太多'
  })
  @Column({
    type: DataType.STRING,
    comment: '描述'
  })
  declare description: string

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '排序',
    defaultValue: DataType.INTEGER
  })
  declare sort: number

}