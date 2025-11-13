// koa的挂载和静态资源开放等
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

// yesong H5 构建产物目录（挂载到 /mini-app）
const yesongH5Root = path.resolve(__dirname, '../../../../web-mini/apps/yesong/dist/h5/mini-app')
// 视频静态目录（挂载到 /video）
const videoRoot = path.join(__dirname, '../static/video')
if (!fs.existsSync(videoRoot)) {
  fs.mkdirSync(videoRoot, { recursive: true })
}

const app = new koa()
// 监听错误的
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
// 跨域
// @ts-ignore
app
  .use(koaBody({
    multipart: true,
    formidable: {
      uploadDir: path.join(__dirname, '../upload'), //设置上传目录
      keepExtensions: true //保留拓展名
    }
  }))
  .use(loggerMiddleware)
  .use(async (ctx, next) => {
    // CORS 设置：允许本地开发的跨域与自定义头
    ctx.set('Access-Control-Allow-Origin', '*')
    // 允许前端发送的头，包含 Authorization 与 Blade-Auth 等
    const reqHeaders = ctx.get('Access-Control-Request-Headers')
    const allowHeaders = reqHeaders || 'Content-Type, Authorization, Blade-Auth'
    ctx.set('Access-Control-Allow-Headers', allowHeaders)
    ctx.set('Access-Control-Expose-Headers', 'Content-Type, Authorization, Blade-Auth')
    ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    // 预检请求直接返回，避免浏览器阻塞
    if (ctx.method === 'OPTIONS') {
      ctx.status = 204
      return
    }
    await next()
  })
  .use(jwtMiddleware)
  //开放html模板的静态目录,你可以把打包后的html文件放到这个目录下
  .use(staticFiles(path.join(__dirname, '../static/views/'), { extensions: ['html'] }))
  .use(staticFiles(path.join(__dirname, '../static/icons/'), { extensions: ['png'] }))
  .use(staticFiles(path.join(__dirname, '../logs/'), { extensions: ['log'] }))
  // 开放上传目录作为静态资源，挂载到 /upload 前缀，访问 /upload/<filename>
  .use(mount('/upload', staticFiles(path.join(__dirname, '../upload'))))
  // 开放视频目录，挂载到 /video 前缀，访问 /video/<filename>.mp4
  .use(mount('/video', staticFiles(videoRoot)))
  // 将 web-mini 的 H5 打包产物挂载到 /mini-app，直接提供静态资源服务
  .use(mount('/mini-app', staticFiles(yesongH5Root)))
  .use(indexRouter.routes())
  // 同时挂载带 /api 前缀的路由，兼容前端请求以 /api 开头
  .use(apiIndexRouter.routes())
  // SPA 路由回退：优先匹配 mini-app，其次匹配 yesong-admin
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
  // 未匹配到任何资源时才返回自定义 404 响应
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