import fs from 'fs'
import Router from 'koa-router'

const indexRouter = new Router()

// 获取当前目录下所有的文件，排除当前文件
const files = fs.readdirSync(__dirname)
  .filter(file => file !== 'index.ts')
files.forEach(file => {
  const routeModule = require(`./${file}`)
  if (routeModule.routes) {
    indexRouter.use(routeModule.routes())
  }
})

// 判断某个 method/path 是否已在路由中注册
const isLegalRoute = (method: string, path: string) => {
  if (!method || !path) return false
  const upper = method.toUpperCase()
  // @ts-ignore
  const stack = (indexRouter as any).stack || []
  for (const layer of stack) {
    const methods: string[] = (layer?.methods || [])
    // 只检查有方法的路由层
    if (methods.length > 0 && methods.includes(upper)) {
      // koa-router 的 layer 一般有 regexp 可用于匹配
      if (layer?.regexp && layer.regexp.test(path)) {
        return true
      }
      // 兜底：尝试直接匹配静态路径
      if (layer?.path && layer.path === path) {
        return true
      }
    }
  }
  return false
}

export { isLegalRoute }
export default indexRouter