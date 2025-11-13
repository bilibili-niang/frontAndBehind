import { Column, DataType, Table } from 'sequelize-typescript'
import BaseModel from '@/schema/baseModal'

@Table({
  tableName: 'system_page',
  paranoid: true
})
export default class SystemPage extends BaseModel {
  // —— 旧字段（兼容已有列表展示） ——
  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: '页面名称'
  })
  declare name: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: '场景/作用域，如 weapp/mall/store/yesong'
  })
  declare scene: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '最后编辑人'
  })
  declare editUser: string

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: '页面配置（JSON）'
  })
  declare config: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '描述备注'
  })
  declare description: string

  // —— 新增字段（对齐用户给出的结构） ——
  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '租户ID（数字或字符串）'
  })
  declare tenantId: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '商户ID'
  })
  declare merchantId: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '页面唯一键（如 services-list）；自定义页面可为空'
  })
  declare key: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '页面标题（与 name 保持一致或更详细）'
  })
  declare title: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '标签（逗号分隔或自由文本）'
  })
  declare tags: string

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: '页面装修配置（JSON 串）'
  })
  declare decorate: string

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    comment: '来源/平台标识（数字枚举）'
  })
  declare origin: number

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '版本号'
  })
  declare version: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '创建人（如果与系统默认 createdAt 配套）'
  })
  declare createUser: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '更新人'
  })
  declare updateUser: string

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '是否删除（0 否 1 是）'
  })
  declare isDeleted: number

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '是否系统保护（1 为不可删除）'
  })
  declare isProtected: number
}