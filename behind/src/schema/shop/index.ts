import { Column, DataType, Default, Table } from 'sequelize-typescript'
import BaseModel from '@/schema/baseModel'

@Table({
  tableName: 'shop',
  paranoid: true
})
export default class Shop extends BaseModel {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: '门店名称'
  })
  declare name: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: '门店编码/编号（唯一）'
  })
  declare code: string

  @Default(1)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '状态：0-禁用 1-启用'
  })
  declare status: number

  // 区域（省市区等，可存字符串或编码）
  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '所属区域（省市区）'
  })
  declare region: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '联系人/店长'
  })
  declare contactName: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '联系电话'
  })
  declare contactPhone: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '门店地址'
  })
  declare address: string

  // 营业时间
  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '开门时间，格式 HH:mm:ss'
  })
  declare openingAt: string

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: '关门时间，格式 HH:mm:ss'
  })
  declare closingAt: string

  // 经纬度与定位
  @Column({
    type: DataType.DECIMAL(10, 6),
    allowNull: true,
    comment: '经度'
  })
  declare longitude: number

  @Column({
    type: DataType.DECIMAL(10, 6),
    allowNull: true,
    comment: '纬度'
  })
  declare latitude: number

  @Column({
    type: DataType.JSON,
    allowNull: true,
    comment: '定位对象 { lng, lat }'
  })
  declare location: { lng: string; lat: string } | null

  @Column({
    type: DataType.DECIMAL(10, 3),
    allowNull: true,
    comment: '距离（单位自定义）'
  })
  declare distance: number | null

  // 联系人信息列表
  @Column({
    type: DataType.JSON,
    allowNull: true,
    comment: '联系人信息数组'
  })
  declare contactInfo: Array<{ contactName: string; contactPhone: string }>
}