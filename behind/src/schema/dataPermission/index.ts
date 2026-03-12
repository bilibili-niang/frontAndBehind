import { Column, DataType, Default, ForeignKey, Table } from 'sequelize-typescript'
import BaseModel from '@/schema/baseModel'
import Role from '@/schema/role'

/**
 * 数据权限规则模型
 * 用于定义角色的数据权限规则
 */
@Table({
  tableName: 'data_permissions',
  paranoid: true,
  comment: '数据权限规则表'
})
export default class DataPermission extends BaseModel {
  @ForeignKey(() => Role)
  @Column({
    type: DataType.STRING(36),
    allowNull: false,
    comment: '角色ID'
  })
  declare roleId: string

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    comment: '资源类型（表名/实体名）：如 user, order, product'
  })
  declare resourceType: string

  @Default(4)
  @Column({
    type: DataType.TINYINT,
    comment: '数据权限范围：1-全部 2-本部门 3-本部门及以下 4-仅本人 5-自定义'
  })
  declare scope: number

  @Column({
    type: DataType.TEXT,
    comment: '自定义规则（JSON格式）：{"deptIds": ["1", "2"], "userIds": ["3"]}'
  })
  declare customRule: string

  @Default(1)
  @Column({
    type: DataType.TINYINT,
    comment: '状态：0-禁用 1-启用'
  })
  declare status: number
}
