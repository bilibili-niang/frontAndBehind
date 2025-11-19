import Taro, { useRouter } from '@tarojs/taro'

/** 判断是否某一个指定页面 */
export const isThePage = (currentRoute?: string, route?: string) => {
  if (!currentRoute || !route) return false
  console.log(currentRoute.replace(/^\//, ''), route.replace(/^\//, ''))
  return currentRoute.replace(/^\//, '').startsWith(route.replace(/^\//, ''))
}

interface IRoute extends Taro.RouterInfo<Partial<Record<string, string>>> {
  [key: string]: any
}

/** 获取页面路由 Key */
export const getPageKey = (route?: any) => {
  const _route = (route ?? useRouter()) as IRoute
  return _route?.params?.$taroTimestamp ?? _route?.$taroParams?.$taroTimestamp
}
