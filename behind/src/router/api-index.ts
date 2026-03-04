import fs from 'fs'
import Router from 'koa-router'

// 使用前缀 /api，为兼容前端以 /api 开头的接口路径
const apiRouter = new Router({ prefix: '/api' })

// 获取当前目录下所有的文件，排除本文件
const files = fs
  .readdirSync(__dirname)
  .filter(file => file !== 'api-index.ts' && file !== 'index.ts')

files.forEach(file => {
  const routeModule = require(`./${file}`)
  const router = routeModule?.routes ? routeModule : routeModule?.default
  if (router?.routes) {
    apiRouter.use(router.routes())
  }
})

export default apiRouter
