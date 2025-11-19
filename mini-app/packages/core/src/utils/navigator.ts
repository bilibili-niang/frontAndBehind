import Taro from '@tarojs/taro'

type navigateToOptions = Taro.navigateTo.Option

/** 跳转至，小程序环境下若超出路由栈数量限制，将改为重定向 redirectTo */
export let navigateTo = (options: navigateToOptions, redirect?: boolean) => {
  if (!options.url.startsWith('http') && !options.url.startsWith('/')) {
    options.url = '/' + options.url
  }

  if (redirect) {
    redirectTo(options)
  }

  // 在小程序 webview 环境中
  if (process.env.TARO_ENV === 'h5' && window.__wxjs_environment === 'miniprogram') {
    return window.wx.miniProgram.navigateTo(options)
  }
  return Taro.navigateTo({
    ...options,
    fail: err => {
      // 微信没有其他可供判断的内容，万一哪天错误信息就改掉了...
      if (err.errMsg.includes('count limit exceed')) {
        // 超出路由栈数量限制，改为重定向
        redirectTo(options)
      } else {
        options.fail?.(err)
      }
    }
  })
}

/** 重定向至 */
export const redirectTo = (options: navigateToOptions) => {
  if (process.env.TARO_ENV === 'h5' && window.__wxjs_environment === 'miniprogram') {
    return window.wx.miniProgram.redirectTo(options)
  }
  return Taro.redirectTo(options)
}

/**
 * 将包含【同步执行】navigateTo 的函数转化为 redirectTo，返回新的函数
 *
 * **如需异步/回调执行请另外使用 redirectTo 封装**
 */
export const toRedirect = <T extends (...args: any[]) => void>(navigateFn: T) => {
  return (...args: Parameters<T>) => {
    // 将 navigateTo 引用修改为 redirectTo，因为是同步执行，不会有任何问题。
    const temp = navigateTo
    navigateTo = redirectTo
    try {
      return navigateFn(...args)
    } finally {
      // 恢复引用
      navigateTo = temp
    }
  }
}

/** 提取有效的查询参数，undefined 将被过滤掉 */
const extractValidQuery = <T extends Record<string, any>>(obj: T): Partial<T> => {
  const payload: Partial<T> = {}

  for (const key in obj) {
    if (obj.hasOwnProperty(key) && obj[key] !== undefined) {
      payload[key] = decodeURIComponent(obj[key]) as any
    }
  }

  return payload
}

/** 构建路由链接 */
export const buildUrl = (url: string, query?: Record<string, any>) => {
  const queryString = query ? new URLSearchParams(extractValidQuery(query)).toString() : ''
  return queryString ? `${url}?${queryString}` : url
}
