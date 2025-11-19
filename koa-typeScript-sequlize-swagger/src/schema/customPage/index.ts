import { Column, DataType, Table } from 'sequelize-typescript'
import BaseModel from '@/schema/baseModal'

// 使用 sequelize-typescript 装饰器，保持与其他模型一致
@Table({
  tableName: 'custom_page',
  paranoid: true
})
export default class CustomPage extends BaseModel {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: '页面名称/标题'
  })
  declare name: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: '业务场景，如 yesong 等'
  })
  declare scene: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '描述信息'
  })
  declare description: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '最后编辑人'
  })
  declare editUser: string

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: '装修 JSON 数据（字符串存储）'
  })
  declare decorate: string

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    comment: '版本号（可选）'
  })
  declare version: number
}