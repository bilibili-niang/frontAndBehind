import { Context, Next } from 'koa'

// 无鉴权版本：放行所有请求（包括原先声明需要鉴权的路由）
export let needAuthRouters: string[] = []

export const jwtMiddleware = async (_ctx: Context, next: Next) => {
  // 后端不做鉴权，直接进入后续中间件/路由处理
  await next()
}

export const jwtMust = async (_ctx: Context, next: Next) => {
  // 路由级鉴权也禁用，统一放行
  await next()
}