import { Column, DataType, Table } from 'sequelize-typescript'
import BaseModel from '@/schema/baseModal'

@Table({
  tableName: 'auth_weapp',
  paranoid: true
})
export default class AuthWeapp extends BaseModel {

  @Column({
    type: DataType.STRING(64),
    allowNull: false,
    comment: '微信 openid'
  })
  declare openId: string

  @Column({
    type: DataType.STRING(64),
    allowNull: true,
    comment: '微信 unionid（可选）'
  })
  declare unionId: string

  @Column({
    type: DataType.STRING(64),
    allowNull: true,
    comment: '会话密钥（session_key）'
  })
  declare sessionKey: string

  @Column({
    type: DataType.STRING(11),
    allowNull: true,
    comment: '手机号（从微信获取）'
  })
  declare phoneNumber: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '绑定的用户ID'
  })
  declare userId: string
}