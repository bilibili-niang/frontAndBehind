/**
 * 覆盖原生 Date 类，主要处理：
 * 1. new Date() 无参数时（当前设备时间）添加偏移量
 * 2. Date.now() 获取当前设备时间，添加偏移量
 * 3. new Date 兼容 ios 设备，YYYY-MM-DD 会产生异常，自动将 `-` 修改为 `/`
 */

// FIXME 夏令时（DST）需要兼容处理么？

import dayjs from 'dayjs'
import { getServerTime } from '../api'
import { useAppStore } from '../stores'

/** 时间偏移量，用于抹平设备时间与服务器时间差距 */
let offset = 0

/** 原生 Date 对象 */
const nativeDate = Date

// 重写 Date 构造函数
// @ts-ignore
Date = function (...args) {
  if (arguments.length > 0 && typeof arguments[0] === 'string' && arguments[0].includes('-')) {
    const p = arguments[0].replace(/-/g, '/')
    arguments[0] = p
  }
  const newDate = new nativeDate(...args)

  // 没有参数时，表示使用当前时间，需要添加偏移量
  if (args.length === 0) {
    newDate.setTime(newDate.getTime() + offset)
  }
  return newDate
}

// 继承原型链
// @ts-ignore
Date.prototype = nativeDate.prototype

// 继承静态函数，过滤已有的静态函数和参数，取数组差集
const nativeDateStaticParams = Object.getOwnPropertyNames(nativeDate)
nativeDateStaticParams.forEach(p => {
  if (Date[p] === undefined) {
    Date[p] = nativeDate[p]
  }
})

// 覆盖静态方法 Date.now()
Date.now = (...agrs) => {
  return nativeDate.now(...agrs) + offset
}

/** 设置时间偏移量，单位 ms */
export const $setDateOffset = (dateOffset: number) => {
  let _offset = parseInt(String(dateOffset))
  _offset = Number.isNaN(_offset) ? 0 : _offset
  if (isBeyondInterval(_offset)) {
    offset = dateOffset
  }
  // 设置时间偏移量后，需更新当前参考时间
  useAppStore().resetLazyNow()
  log()
}

/** 获取时间偏移量 */
export const $getDateOffset = () => offset

export { nativeDate }

const log = () => {
  const format = 'YYYY-MM-DD HH:mm:ss SSS'
  const nativeNow = dayjs(nativeDate.now())
  const realNow = dayjs()
  const interval = realNow.valueOf() - nativeNow.valueOf()
  console.log(
    `%cDate 类已被覆盖：\n本设备时间 ${nativeNow.format(format)}; \n服务器时间 ${realNow.format(
      format
    )}; \n时间差 ${interval}ms，${isBeyondInterval(offset) ? '消除差异' : '小于 1000 ms 忽略差异'}`,
    'color:#27ae60'
  )
}

/**
 * 同步服务器时间：
 * 1. 时间差距不超过 1000 毫秒，则使用本地时间
 * 2. 请求响应时长超过 300 毫秒，则使用本地时间，延迟 1000 毫秒重试最多 5 次，直到命中
 */
const syncServerTime = () => {
  const startTs = nativeDate.now()
  getServerTime()
    .then((res: any) => {
      const endTs = nativeDate.now()
      const requestCostTime = endTs - startTs
      // 假定理想情况下，请求 和 响应耗时一致
      const responseCostTime = requestCostTime / 2
      if (requestCostTime > 300) {
        if (syncServerTimeRetryCount < 5) {
          syncServerTimeRetryCount++
          setTimeout(syncServerTime, 1000)
        }
        return void 0
      }

      // endTs - responseCostTime ≈ 服务器生成时间戳时刻「本设备的时间戳」
      const _offset = Math.floor(new nativeDate(res.data as string).getTime() - (endTs - responseCostTime))
      $setDateOffset(_offset)
    })
    .catch(() => {
      console.log('%c获取服务器时间失败', 'color:#e74c3c')
    })
}

let syncServerTimeRetryCount = 0

/** 超过可接受时间差范围 */
const isBeyondInterval = (interval: number) => {
  return interval > 1000 || interval < -1000
}

syncServerTime()
