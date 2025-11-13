import { Column, DataType, Table, Default } from 'sequelize-typescript'
import BaseModel from '@/schema/baseModal'

@Table({
  tableName: 'illegal_request',
  paranoid: true
})
export default class IllegalRequest extends BaseModel {
  @Column({
    type: DataType.STRING(45),
    comment: '请求来源IP',
    allowNull: true
  })
  declare ip: string

  @Column({
    type: DataType.STRING(10),
    comment: 'HTTP方法',
    allowNull: true
  })
  declare method: string

  @Column({
    type: DataType.STRING(255),
    comment: '请求路径',
    allowNull: true
  })
  declare path: string

  @Column({
    type: DataType.INTEGER,
    comment: 'HTTP状态码',
    allowNull: true
  })
  declare statusCode: number

  @Column({
    type: DataType.STRING(50),
    comment: '日志级别: warn/error/fatal等',
    allowNull: true
  })
  declare level: string

  @Column({
    type: DataType.TEXT,
    comment: '非法原因或总结信息',
    allowNull: true
  })
  declare reason: string

  @Column({
    type: DataType.TEXT,
    comment: '请求头(裁剪/序列化)',
    allowNull: true
  })
  declare headers: string

  @Column({
    type: DataType.TEXT,
    comment: '查询参数或请求体(序列化)',
    allowNull: true
  })
  declare payload: string

  @Column({
    type: DataType.TEXT,
    comment: 'UA',
    allowNull: true
  })
  declare userAgent: string
}
