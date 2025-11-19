import Taro, { useRouter } from '@tarojs/taro'

/** 判断是否某一个指定页面 */
export const isThePage = (currentRoute?: string, route?: string) => {
  console.log('currentRoute', currentRoute)
  console.log('route', route)
  if (!currentRoute || !route) return false
  return currentRoute.replace(/^\//, '').startsWith(route.replace(/^\//, ''))
}

/** 获取路由栈数量差，以当前路由（栈最后一个）为参考，若不存在页面返回 -1 */
export const getStackDeltaOfPages = (path: string) => {
  const pages = Taro.getCurrentPages()
  const index = pages.findIndex(item => isThePage(item.route, path))
  if (index === -1) return -1
  return pages.length - 1 - index
}

interface IRoute extends Taro.RouterInfo<Partial<Record<string, string>>> {
  [key: string]: any
}

/** 获取页面路由 Key */
export const getPageKey = (route?: any) => {
  const _route = (Taro.getCurrentInstance()?.router || (route ?? useRouter())) as IRoute
  return _route?.params?.$taroTimestamp ?? _route?.$taroParams?.$taroTimestamp
}

let backTimer

/** 返回页面 */
export const navigateBack = (fail?: () => void) => {
  const pathKey = getPageKey()
  clearTimeout(backTimer)
  backTimer = setTimeout(() => {
    const newPathKey = getPageKey()
    if (pathKey === newPathKey) {
      fail?.()
    }
    // FIXME 这里具体需要多少时间？
  }, 600)
  if (process.env.TARO_ENV === 'h5') {
    history.go(-1)
  } else {
    Taro.navigateBack()
  }
}
