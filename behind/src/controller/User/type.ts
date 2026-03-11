import { z } from 'koa-swagger-decorator'
import { commonResponse } from '@/controller/common'

// 创建/登录用户的请求
const CreateUserReq = z.object({
  userName: z.string().nonempty(),
  password: z.string().nonempty(),
  // 允许在创建时携带手机号并持久化，必须符合中国手机号格式
  phoneNumber: z.string()
    .regex(/^1[3-9]\d{9}$/, '手机号格式不正确，必须是11位数字且以1开头')
    .optional(),
})

// 创建用户的响应
const CreateUserRes = commonResponse({
  data: z.object({
    count: z.number(),
    rows: z.array(z.object({
      id: z.number(),
      userName: z.string(),
      createdAt: z.string(),
      updatedAt: z.string()
    }))
  })
})

// 用户列表的响应（统一为前端分页格式）
const UserItem = z.object({
  id: z.union([z.string(), z.number()]),
  userName: z.string().optional(),
  avatar: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  roleId: z.union([z.string(), z.number()]).optional(),
  isAdmin: z.union([z.number(), z.boolean()]).optional(),
  status: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
})

const UserListRes = commonResponse({
  data: z.object({
    countId: z.string(),
    current: z.number(),
    maxLimit: z.number(),
    optimizeCountSql: z.boolean(),
    orders: z.array(z.any()),
    pages: z.number(),
    records: z.array(UserItem),
    searchCount: z.boolean(),
    size: z.number(),
    total: z.number()
  })
})

// 用户登录的响应（返回 token 和基础用户信息）
const UserLoginRes = commonResponse({
  data: z.object({
    token: z.string(),
    userInfo: z.object({
      id: z.union([z.string(), z.number()]),
      userName: z.string().optional(),
      avatar: z.string().optional().nullable(),
      phoneNumber: z.string().optional().nullable(),
      email: z.string().optional().nullable(),
      gender: z.string().optional().nullable(),
      isAdmin: z.union([z.number(), z.boolean()]).optional(),
      status: z.number().optional(),
      createdAt: z.string().optional(),
      updatedAt: z.string().optional()
    })
  })
})

// 删除用户的query
export const DeleteUserQuery = z.object({
  id: z.string().nonempty()
})

// 删除用户的响应
const DeleteUserRes = z.object({
  id: z.string(),
})

export type ICreateUserRes = z.infer<typeof CreateUserRes>;
export type ICreateUserReq = z.infer<typeof CreateUserReq>;
export type IDeleteUserQuery = z.infer<typeof DeleteUserQuery>;

export {
  CreateUserRes,
  CreateUserReq,
  DeleteUserRes,
  UserLoginRes,
  UserListRes
}

// 登录请求体：支持用户名或手机号登录，密码必填。
// 由于 koa-swagger-decorator 对 @body 的类型要求是 ZodObject，
// 这里不使用 refine（会返回 ZodEffects），跨字段校验在控制器中处理。
export const LoginReq = z.object({
  userName: z.string().nonempty().optional().describe('用户名'),
  phoneNumber: z.string().nonempty().optional().describe('手机号'),
  password: z.string().nonempty().describe('密码'),
})

export type ILoginReq = z.infer<typeof LoginReq>