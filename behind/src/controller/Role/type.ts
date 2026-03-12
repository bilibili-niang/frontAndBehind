import { z } from 'koa-swagger-decorator'
import { commonResponse } from '@/controller/common'

/**
 * 创建角色请求体
 */
export const CreateRoleReq = z.object({
  name: z.string().min(1).max(50),
  displayName: z.string().min(1).max(100),
  description: z.string().max(255).optional(),
  status: z.number().default(1),
  isDefault: z.boolean().default(false),
  dataScope: z.number().default(1),
  permissionIds: z.array(z.string()).optional()
})

/**
 * 更新角色请求体
 */
export const UpdateRoleReq = z.object({
  displayName: z.string().min(1).max(100).optional(),
  description: z.string().max(255).optional(),
  status: z.number().optional(),
  isDefault: z.boolean().optional(),
  dataScope: z.number().optional(),
  permissionIds: z.array(z.string()).optional()
})

/**
 * 分配角色请求体
 */
export const AssignRoleReq = z.object({
  userId: z.string().min(1),
  roleIds: z.array(z.string())
})

export type ICreateRoleReq = z.infer<typeof CreateRoleReq>
export type IUpdateRoleReq = z.infer<typeof UpdateRoleReq>
export type IAssignRoleReq = z.infer<typeof AssignRoleReq>
