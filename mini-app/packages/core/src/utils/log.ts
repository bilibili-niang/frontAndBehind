const nativeConsoleLog = console.log

/**
 * 重写 console.log 方法
 */
// try {
//   const isProduction = process.env.NODE_ENV === 'production'

//   if (isProduction) {
//     console.log = function (...args) {
//       if (process.env.TARO_ENV === 'h5') {
//         // 检查页面链接是否存在 debug=true 参数
//         const urlParams = new URLSearchParams(window.location.search)
//         if (urlParams.has('debug') && urlParams.get('debug') === 'true') {
//           nativeConsoleLog.apply(console, args)
//         }
//       } else {
//         nativeConsoleLog.apply(console, args)
//       }
//     }
//   }
// } catch (error) {
//   console.error('console.log 拦截失败')
// }

/**
 * console.log 拦截版
 * 1. 生产环境下仅某些特定条件下输出：
 *  h5：链接 query 中包含 debug=true
 *  小程序：SystemInfo.enableDebug 开启后
 * 2. 开发、测试环境下不限制
 */
export const devLog: Console['log'] = (...args: any[]) => {
  if (process.env.NODE_ENV === 'production') {
    if (process.env.TARO_ENV === 'h5') {
      // 检查页面链接是否存在 debug=true 参数
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.has('debug') && urlParams.get('debug') === 'true') {
        nativeConsoleLog.apply(console, args)
      }
    } else {
      // TODO 小程序环境支持 console.log 拦截
      nativeConsoleLog.apply(console, args)
    }
  } else {
    nativeConsoleLog(...args)
  }
}
