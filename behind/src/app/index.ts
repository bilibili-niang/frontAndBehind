/**
 * Koa 应用入口配置
 * 负责应用初始化、中间件挂载、静态资源服务和路由配置
 */

import koa from 'koa'
import indexRouter from '@/router/index'
import apiIndexRouter from '@/router/api-index'
import koaBody from 'koa-body'
import path from 'path'
import onError from 'koa-onerror'
import staticFiles from 'koa-static'
import mount from 'koa-mount'
import fs from 'fs'
import { error, trace } from '@/config/log4j'
import { ctxBody, formatError } from '@/utils'
import { loggerMiddleware } from '@/middleware/loggerMiddleware'
import { jwtMiddleware } from '@/middleware'

/**
 * yesong H5 构建产物目录
 * 挂载到 /mini-app 路径，提供小程序 H5 版本的静态资源服务
 */
const yesongH5Root = path.resolve(__dirname, '../../../../web-mini/apps/yesong/dist/h5/mini-app')

/**
 * 视频静态目录
 * 挂载到 /video 路径，用于存储和提供视频文件
 */
const videoRoot = path.join(__dirname, '../static/video')
if (!fs.existsSync(videoRoot)) {
  fs.mkdirSync(videoRoot, { recursive: true })
}

const app = new koa()

/**
 * 错误处理配置
 * 捕获应用中的未处理错误，统一返回 JSON 格式的错误响应
 */
onError(app, {
  json: function (err, ctx) {
    ctx.status = 500
    const formatted = formatError(err)
    ctx.body = ctxBody({
      code: 500,
      success: false,
      msg: formatted.message,
      data: { issues: formatted.issues, detail: formatted.detail }
    })
  }
})

/**
 * 中间件链配置
 * 按顺序挂载各类中间件
 */
// @ts-ignore
app
  // 1. 请求体解析：支持 multipart/form-data 文件上传
  .use(koaBody({
    multipart: true,
    formidable: {
      uploadDir: path.join(__dirname, '../upload'), // 设置上传目录
      keepExtensions: true // 保留文件拓展名
    }
  }))
  // 2. 日志记录中间件：记录请求日志
  .use(loggerMiddleware)
  // 3. CORS 跨域配置：允许本地开发和自定义请求头
  .use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*')
    // 允许前端发送的头，包含 Authorization 与 Blade-Auth 等
    const reqHeaders = ctx.get('Access-Control-Request-Headers')
    const allowHeaders = reqHeaders || 'Content-Type, Authorization, Blade-Auth'
    ctx.set('Access-Control-Allow-Headers', allowHeaders)
    ctx.set('Access-Control-Expose-Headers', 'Content-Type, Authorization, Blade-Auth')
    ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    // 预检请求直接返回 204，避免浏览器阻塞
    if (ctx.method === 'OPTIONS') {
      ctx.status = 204
      return
    }
    await next()
  })
  // 4. JWT 认证中间件：解析 Token 并挂载到 ctx
  .use(jwtMiddleware)
  // 5. 静态资源服务：HTML 模板目录
  .use(staticFiles(path.join(__dirname, '../static/views/'), { extensions: ['html'] }))
  // 6. 静态资源服务：图标目录
  .use(staticFiles(path.join(__dirname, '../static/icons/'), { extensions: ['png'] }))
  // 7. 静态资源服务：日志目录
  .use(staticFiles(path.join(__dirname, '../logs/'), { extensions: ['log'] }))
  // 8. 上传文件静态服务：挂载到 /upload 前缀
  .use(mount('/upload', staticFiles(path.join(__dirname, '../upload'))))
  // 9. 视频文件静态服务：挂载到 /video 前缀
  .use(mount('/video', staticFiles(videoRoot)))
  // 10. yesong H5 静态资源：挂载到 /mini-app 前缀
  .use(mount('/mini-app', staticFiles(yesongH5Root)))
  // 11. 主路由
  .use(indexRouter.routes())
  // 12. API 路由（带 /api 前缀，兼容前端请求）
  .use(apiIndexRouter.routes())
  /**
   * SPA 路由回退中间件
   * 处理单页应用的前端路由，优先匹配 mini-app，其次匹配 yesong-admin
   * 
   * 逻辑说明：
   * 1. 只处理 GET/HEAD 请求且未被处理的请求（404 或无响应）
   * 2. mini-app 优先：路径包含 mini-app 且非静态资源时，回退到 index.html
   * 3. yesong-admin 兜底：路径以 /yesong-admin 开头时，回退到 admin 的 index.html
   */
  .use(async (ctx, next) => {
    // 先让前面中间件（静态与路由）有机会处理
    await next()

    const method = ctx.method
    const pathName = ctx.path
    const isGetLike = method === 'GET' || method === 'HEAD'
    const noResponse = ctx.body === undefined || ctx.status === 404

    // 1) mini-app 优先：当路径包含 mini-app 且未被处理时，对非静态资源回退到打包入口
    if (isGetLike && noResponse && pathName.includes('mini-app')) {
      const isAsset = /\.(js|css|png|jpe?g|gif|svg|ico|json|map|woff2?|ttf)$/.test(pathName)
      if (!isAsset) {
        const miniIndex = path.join(yesongH5Root, 'index.html')
        if (fs.existsSync(miniIndex)) {
          ctx.type = 'html'
          ctx.status = 200
          ctx.body = fs.createReadStream(miniIndex)
          return
        }
      }
    }

    // 2) yesong-admin 兜底：当以 /yesong-admin 开头且未被处理时，回退到 admin 的入口
    if (isGetLike && noResponse && pathName.startsWith('/yesong-admin')) {
      const adminIndex = path.join(__dirname, '../static/views/yesong-admin/index.html')
      if (fs.existsSync(adminIndex)) {
        ctx.type = 'html'
        ctx.status = 200
        ctx.body = fs.createReadStream(adminIndex)
        return
      }
    }
  })
  /**
   * 全局错误监听
   * 捕获应用运行时的错误，记录日志并返回统一错误响应
   */
  .on('error', async (err, ctx, next) => {
    ctx.status = 500
    error(JSON.stringify(err), {
      ip: ctx.ip,
      method: ctx.method,
      path: ctx.path,
      statusCode: ctx.status,
      headers: ctx.headers,
      payload: ctx.request.body ?? ctx.query,
      userAgent: ctx.headers['user-agent'] as string
    })
    const formatted = formatError(err)
    ctx.body = ctxBody({
      code: 500,
      success: false,
      msg: formatted.message,
      data: { issues: formatted.issues, detail: formatted.detail }
    })
  })
  /**
   * 404 处理中间件
   * 当所有中间件都无法匹配请求时，返回自定义 404 响应
   */
  .use((ctx) => {
    if (ctx.body !== undefined && ctx.status !== 404) {
      return
    }
    trace('未知url ' + ctx.request.url, {
      ip: ctx.ip,
      method: ctx.method,
      path: ctx.path,
      statusCode: 404,
      headers: ctx.headers,
      payload: ctx.request.body ?? ctx.query,
      userAgent: ctx.headers['user-agent'] as string
    })
    ctx.status = 404
    ctx.body = ctxBody({
      code: 404,
      msg: `这里是无人之境`,
    })
  })

export default app
