import { z } from 'koa-swagger-decorator'
import { commonResponse } from '@/controller/common'

/*
* 翻译接口传参
* */
const TranslateReqType = z.object({
  keyword: z.string(),
})
/*
* 翻译接口响应参数
* */
const TranslateResType = commonResponse({
  keyword: z.string(),
  result: z.string(),
})

/*
* 非法请求日志-分页查询 响应参数
* */
const IllegalLogListRes = commonResponse({
  data: z.object({
    count: z.number(),
    rows: z.array(z.object({
      id: z.string(),
      ip: z.string().optional().nullable(),
      method: z.string().optional().nullable(),
      path: z.string().optional().nullable(),
      statusCode: z.number().optional().nullable(),
      level: z.string().optional().nullable(),
      reason: z.string().optional().nullable(),
      headers: z.string().optional().nullable(),
      payload: z.string().optional().nullable(),
      userAgent: z.string().optional().nullable(),
      createdAt: z.string().optional(),
      updatedAt: z.string().optional()
    }))
  })
})

export {
  TranslateReqType,
  TranslateResType,
  IllegalLogListRes
}
