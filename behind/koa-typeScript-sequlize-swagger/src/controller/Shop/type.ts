import { z } from 'koa-swagger-decorator'
import { commonResponse } from '@/controller/common'

export const CreateShopReq = z.object({
  id: z.string().optional(),
  name: z.string().nonempty(),
  code: z.string().optional(),
  status: z.number().optional(),
  region: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  openingAt: z.string().optional().nullable(),
  closingAt: z.string().optional().nullable(),
  longitude: z.union([z.string(), z.number()]).optional().nullable(),
  latitude: z.union([z.string(), z.number()]).optional().nullable(),
  location: z
    .object({ lng: z.coerce.string().optional(), lat: z.coerce.string().optional() })
    .optional()
    .nullable(),
  distance: z.union([z.number(), z.string()]).optional().nullable(),
  contactInfo: z
    .array(z.object({ contactName: z.string().optional(), contactPhone: z.string().optional() }))
    .optional()
    .nullable()
})

export const UpdateShopReq = z.object({
  name: z.string().optional(),
  code: z.string().optional(),
  status: z.number().optional(),
  region: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  openingAt: z.string().optional().nullable(),
  closingAt: z.string().optional().nullable(),
  longitude: z.union([z.string(), z.number()]).optional().nullable(),
  latitude: z.union([z.string(), z.number()]).optional().nullable(),
  location: z
    .object({ lng: z.coerce.string().optional(), lat: z.coerce.string().optional() })
    .optional()
    .nullable(),
  distance: z.union([z.number(), z.string()]).optional().nullable(),
  contactInfo: z
    .array(z.object({ contactName: z.string().optional(), contactPhone: z.string().optional() }))
    .optional()
    .nullable()
})

export const DeleteShopQuery = z.object({ id: z.string().nonempty() })

const ShopItem = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string().optional().nullable(),
  status: z.number(),
  region: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  openingAt: z.string().optional().nullable(),
  closingAt: z.string().optional().nullable(),
  longitude: z.union([z.string(), z.number()]).optional().nullable(),
  latitude: z.union([z.string(), z.number()]).optional().nullable(),
  location: z.object({ lng: z.string().optional(), lat: z.string().optional() }).optional().nullable(),
  distance: z.union([z.number(), z.string()]).optional().nullable(),
  contactInfo: z.array(z.object({ contactName: z.string().optional(), contactPhone: z.string().optional() })).optional().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
})

export const ShopListRes = commonResponse({
  data: z.object({
    countId: z.string(),
    current: z.number(),
    maxLimit: z.number(),
    optimizeCountSql: z.boolean(),
    orders: z.array(z.any()),
    pages: z.number(),
    records: z.array(ShopItem),
    searchCount: z.boolean(),
    size: z.number(),
    total: z.number()
  })
})

export const ShopCreateRes = commonResponse({
  data: ShopItem
})

export const ShopUpdateRes = commonResponse({
  data: ShopItem
})

export const ShopDeleteRes = z.object({ id: z.string() })

export type ICreateShopReq = z.infer<typeof CreateShopReq>
export type IUpdateShopReq = z.infer<typeof UpdateShopReq>
export type IDeleteShopQuery = z.infer<typeof DeleteShopQuery>

// 移除重复导出，避免 TS2484 冲突