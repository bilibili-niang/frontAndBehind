import { z } from 'koa-swagger-decorator'
import { commonResponse } from '@/controller/common'

/**
 * 创建权限请求体
 */
export const CreatePermissionReq = z.object({
  name: z.string().min(1).max(100),
  displayName: z.string().min(1).max(100),
  type: z.enum(['menu', 'button', 'api', 'data']),
  resource: z.string().min(1).max(50),
  action: z.enum(['view', 'create', 'update', 'delete']),
  parentId: z.string().optional(),
  sort: z.number().default(0),
  status: z.number().default(1)
})

/**
 * 更新权限请求体
 */
export const UpdatePermissionReq = z.object({
  displayName: z.string().min(1).max(100).optional(),
  type: z.enum(['menu', 'button', 'api', 'data']).optional(),
  resource: z.string().min(1).max(50).optional(),
  action: z.enum(['view', 'create', 'update', 'delete']).optional(),
  parentId: z.string().optional(),
  sort: z.number().optional(),
  status: z.number().optional()
})

/**
 * 检查权限请求体
 */
export const CheckPermissionReq = z.object({
  permission: z.string().min(1)
})

export type ICreatePermissionReq = z.infer<typeof CreatePermissionReq>
export type IUpdatePermissionReq = z.infer<typeof UpdatePermissionReq>
export type ICheckPermissionReq = z.infer<typeof CheckPermissionReq>
