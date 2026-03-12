import { z } from 'koa-swagger-decorator'
import { commonResponse } from '@/controller/common'

/**
 * 创建菜单请求体
 */
export const CreateMenuReq = z.object({
  name: z.string().min(1).max(100),
  path: z.string().max(200).optional(),
  component: z.string().max(200).optional(),
  icon: z.string().max(50).optional(),
  permission: z.string().max(100).optional(),
  parentId: z.string().optional(),
  sort: z.number().default(0),
  hidden: z.boolean().default(false),
  keepAlive: z.boolean().default(false),
  status: z.number().default(1)
})

/**
 * 更新菜单请求体
 */
export const UpdateMenuReq = z.object({
  name: z.string().min(1).max(100).optional(),
  path: z.string().max(200).optional(),
  component: z.string().max(200).optional(),
  icon: z.string().max(50).optional(),
  permission: z.string().max(100).optional(),
  parentId: z.string().optional(),
  sort: z.number().optional(),
  hidden: z.boolean().optional(),
  keepAlive: z.boolean().optional(),
  status: z.number().optional()
})

export type ICreateMenuReq = z.infer<typeof CreateMenuReq>
export type IUpdateMenuReq = z.infer<typeof UpdateMenuReq>
