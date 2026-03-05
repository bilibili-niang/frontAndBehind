import Router from 'koa-router'

// 显式导入所有路由模块
import authWeappRouter from './authWeapp'
import decorateRouter from './decorate'
import fakeApiRouter from './fakeApi'
import iconsRouter from './icons'
import navigationRouter from './navigation'
import resumeRouter from './resume'
import shopRouter from './shop'
import staticRouter from './static'
import systemPageRouter from './systemPage'
import testRouter from './test'
import toolRouter from './tool'
import uploadRouter from './upload'
import userRouter from './user'
import userProfileRouter from './userProfile'
import weatherRouter from './wather'

const indexRouter = new Router()

// 注册所有路由
const routers = [
  authWeappRouter,
  decorateRouter,
  fakeApiRouter,
  iconsRouter,
  navigationRouter,
  resumeRouter,
  shopRouter,
  staticRouter,
  systemPageRouter,
  testRouter,
  toolRouter,
  uploadRouter,
  userRouter,
  userProfileRouter,
  weatherRouter
]

routers.forEach(router => {
  if (router?.routes) {
    indexRouter.use(router.routes())
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
