import { Column, DataType, Table } from 'sequelize-typescript'
import BaseModel from '@/schema/baseModal'

@Table({
  tableName: 'resume',
  paranoid: true
})

export default class Resume extends BaseModel {
  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: '简历的数据'
  })
  declare data: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '简历的图片'
  })
  declare img: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '简历的标题'
  })
  declare title: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: '用户id'
  })
  declare userId: string
}