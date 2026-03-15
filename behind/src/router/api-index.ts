import fs from 'fs'
import Router from 'koa-router'
import roleRouter from './role' // 显式导入测试
import permissionRouter from './permission' // 显式导入测试
import menuRouter from './menu' // 显式导入测试

// 使用前缀 /api，为兼容前端以 /api 开头的接口路径
const apiRouter = new Router({ prefix: '/api' })

// 显式挂载 roleRouter
console.log('[DEBUG] Manually mounting roleRouter')
apiRouter.use(roleRouter.routes())

// 显式挂载 permissionRouter
console.log('[DEBUG] Manually mounting permissionRouter')
apiRouter.use(permissionRouter.routes())

// 显式挂载 menuRouter
console.log('[DEBUG] Manually mounting menuRouter')
apiRouter.use(menuRouter.routes())

// 获取当前目录下所有的文件，排除本文件
const files = fs
  .readdirSync(__dirname)
  .filter(file => file !== 'api-index.ts' && file !== 'index.ts' && file !== 'role' && file !== 'permission' && file !== 'menu') // 排除 role, permission, menu 避免重复

files.forEach(file => {
  const routeModule = require(`./${file}`)
  const router = routeModule?.routes ? routeModule : routeModule?.default
  if (router?.routes) {
    console.log(`[DEBUG] Registering API route module: ${file}`)
    if (router.stack) {
       router.stack.forEach((layer: any) => {
         console.log(`  -> [${layer.methods.join(', ')}] /api${layer.path}`)
       })
    }
    apiRouter.use(router.routes())
  }
})

export default apiRouter
