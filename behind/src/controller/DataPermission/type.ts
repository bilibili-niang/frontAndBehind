import { z } from 'zod'

/**
 * 数据权限范围枚举
 */
export const DataScopeEnum = z.enum(['1', '2', '3', '4', '5'])

/**
 * 创建数据权限规则请求体
 */
export const CreateDataPermissionReq = z.object({
  roleId: z.string().min(1, '角色ID不能为空'),
  resourceType: z.string().min(1, '资源类型不能为空'),
  scope: z.enum(['1', '2', '3', '4', '5']).transform(val => parseInt(val)),
  customRule: z.string().optional(),
  status: z.number().default(1)
})

/**
 * 更新数据权限规则请求体
 */
export const UpdateDataPermissionReq = z.object({
  scope: z.enum(['1', '2', '3', '4', '5']).transform(val => parseInt(val)).optional(),
  customRule: z.string().optional(),
  status: z.number().optional()
})

/**
 * 查询数据权限规则请求体
 */
export const QueryDataPermissionReq = z.object({
  roleId: z.string().optional(),
  resourceType: z.string().optional(),
  page: z.string().default('1').transform(val => parseInt(val)),
  size: z.string().default('10').transform(val => parseInt(val))
})

/**
 * 检查数据权限请求体
 */
export const CheckDataPermissionReq = z.object({
  resourceType: z.string().min(1, '资源类型不能为空'),
  dataId: z.string().min(1, '数据ID不能为空')
})
