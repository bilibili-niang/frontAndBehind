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
    records: z.array(z.object({
      id: z.string(),
      ip: z.string().optional().nullable(),
      url: z.string().optional().nullable(),
      method: z.string().optional().nullable(),
      headers: z.string().optional().nullable(),
      body: z.string().optional().nullable(),
      query: z.string().optional().nullable(),
      reason: z.string().optional().nullable(),
      createTime: z.string().optional(),
    })),
    total: z.number(),
    current: z.number(),
    size: z.number(),
    pages: z.number(),
  })
})

export {
  TranslateReqType,
  TranslateResType,
  IllegalLogListRes
}
