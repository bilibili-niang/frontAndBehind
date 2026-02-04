import { safeDayjs } from '@pkg/utils'

/**
 * 定时任务
 * @param timeStr 触发时间，推荐 YYYY-MM-DD HH:mm:ss
 * @param callback 回调函数
 * @param timeout 最大时限，超过将不设置定时任务
 * @returns
 */
const useTiming = (timeStr: string, callback: () => void, timeout: number = 3600000) => {
  let delay = Infinity
  try {
    const targetTime = safeDayjs(timeStr).valueOf()
    const currentTime = Date.now()
    let interval = targetTime - currentTime
    interval = Number.isNaN(interval) ? Infinity : interval
    delay = Math.max(0, interval)
    if (delay > timeout) {
      // `${delay}ms > ${timeout}ms，定时任务已忽略`
      delay = Infinity
    } else {
      // `定时任务 ${delay}ms 后触发`
    }
  } catch (err) {
    console.warn('定时失败：', err.message)
  }

  let stopTimeout = () => {}
  if (delay === Infinity) {
    // 不定时
  } else {
    const id = setTimeout(callback, delay)
    stopTimeout = () => clearTimeout(id)
  }

  return {
    stopTimeout
  }
}

export default useTiming
