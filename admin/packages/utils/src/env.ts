import { isDev } from './devUtils'

/**
 * 判断当前是否为测试或开发环境；若是，则执行传入的回调。
 *
 * 判定规则：
 * - 开发服务器：`import.meta.env.DEV === true`
 * - 测试构建：`import.meta.env.MODE === 'test'`
 *
 * 返回值：
 * - 若为测试/开发环境且提供了回调：返回回调的布尔值或其 Promise<boolean>；
 * - 若为测试/开发环境但未提供回调：返回 true；
 * - 其他环境：返回 false。
 */
export function isTestDev(
  action?: () => boolean | Promise<boolean>
): boolean | Promise<boolean> {
  const mode = (import.meta as any)?.env?.MODE as string | undefined
  const isTest = mode === 'test'
  const flag = isTest || isDev()

  console.log('import.meta')
  console.log(import.meta)

  console.log('mode', mode)
  console.log('isTest', isTest)
  console.log('flag', flag)

  if (!flag) return false

  if (typeof action === 'function') {
    try {
      const result = action()
      // 支持异步回调：识别 thenable
      if (result && typeof (result as any).then === 'function') {
        return (result as Promise<boolean>)
          .then((v) => Boolean(v))
          .catch(() => false)
      }
      return Boolean(result)
    } catch {
      return false
    }
  }

  return true
}

export default isTestDev