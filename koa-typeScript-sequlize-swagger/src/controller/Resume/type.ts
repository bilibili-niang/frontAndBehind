import { z } from 'koa-swagger-decorator'
import { commonResponse } from '@/controller/common'

// 创建简历的请求
const resumeCreateReq = z.object({
  userId: z.string(),
  data: z.string(),
  img: z.string(),
  title: z.string()
})

// 创建简历的响应
const resumeCreateRes = commonResponse({
  data: z.object({
    id: z.number(),
    userId: z.string(),
    data: z.string(),
    img: z.string(),
    title: z.string(),
    createdAt: z.string(),
    updatedAt: z.string()
  })
})

// 获取简历列表的响应
const resumeListRes = commonResponse({
  data: z.object({
    count: z.number(),
    rows: z.array(z.object({
      id: z.number(),
      userId: z.string(),
      data: z.string(),
      img: z.string(),
      title: z.string(),
      createdAt: z.string(),
      updatedAt: z.string()
    }))
  })
})

// 简历ID参数类型
const resumeIdParam = z.string() // 路径参数是字符串

// 获取简历详情的响应
const resumeDetailRes = commonResponse({
  data: z.object({
    id: z.number(),
    userId: z.string(),
    data: z.string(),
    img: z.string(),
    title: z.string(),
    createdAt: z.string(),
    updatedAt: z.string()
  })
})

// 更新简历的请求
const resumeUpdateReq = z.object({
  id: z.number(),
  userId: z.string().optional(),
  data: z.string().optional(),
  img: z.string().optional(),
  title: z.string().optional()
})

// 更新简历的响应
const resumeUpdateRes = commonResponse({
  data: z.object({
    id: z.number(),
    userId: z.string(),
    data: z.string(),
    img: z.string(),
    title: z.string(),
    createdAt: z.string(),
    updatedAt: z.string()
  })
})

// 不需要额外的删除参数类型
// 直接通过路径参数获取ID

// 删除简历的响应
const resumeDeleteRes = commonResponse({
  data: z.null()
})

export type ResumeCreateReq = z.infer<typeof resumeCreateReq>
export type ResumeCreateRes = z.infer<typeof resumeCreateRes>
export type ResumeListRes = z.infer<typeof resumeListRes>
export type ResumeDetailRes = z.infer<typeof resumeDetailRes>
export type ResumeUpdateReq = z.infer<typeof resumeUpdateReq>
export type ResumeUpdateRes = z.infer<typeof resumeUpdateRes>
export type ResumeDeleteRes = z.infer<typeof resumeDeleteRes>

export {
  resumeCreateReq,
  resumeCreateRes,
  resumeListRes,
  resumeIdParam,
  resumeDetailRes,
  resumeUpdateReq,
  resumeUpdateRes,
  resumeDeleteRes
}