import { z } from 'koa-swagger-decorator'
import { commonResponse } from '@/controller/common'

// 字段描述
const FieldSpec = z.object({
  type: z.string().optional().default('string'),
  required: z.boolean().optional(),
  // enum 字段移除，不再在接口定义中出现
  enumAuto: z.union([
    z.number(),
    z.object({ size: z.number().optional() })
  ]).optional(),
  generator: z.string().optional(),
  default: z.any().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  children: z.record(z.any()).optional(),
})

// dataSchema 结构
const DataSchemaSpec = z.object({
  type: z.enum(['object', 'array']),
  schema: z.record(FieldSpec)
})

export const FakeGenerateReq = z.object({
  dataSchema: DataSchemaSpec,
  // 当 type === 'array' 时有效
  count: z.coerce.number().default(10).optional()
})

export const FakeGenerateRes = commonResponse({
  data: z.any()
})

export type IFakeGenerateReq = z.infer<typeof FakeGenerateReq>