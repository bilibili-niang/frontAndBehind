// 从前台代码抄的,因为部分render要用到
import { ref, Ref, watch, onUnmounted, computed } from 'vue'

interface CountdownHook {
  /** 倒计时时间文本 HH:mm:ss */
  countdownTime: Ref<string>
  /** 倒计时秒数 */
  countdownSeconds: Ref<number>
  /** 暂停计算 */
  pauseCountdown: () => void
  /** 终止计算 */
  stopCountdown: () => void
  /** 重新开始计算（实时） */
  resumeCountdown: () => void
  /** 倒计时结束回调，！注意如果已经超过时间，会立即回调一次，需避免重复循环 */
  onCountdownEnd: (callback: () => void) => void
}

interface CountdownHookOptions {
  /** 格式化，默认 HH:mm:ss，支持自定义格式化函数 */
  format?: string | ((seconds: number) => string)
}

/**
 * 格式化时间长度
 * @param seconds 秒数，正整数
 * @param formatStr 格式化字符串，默认为 HH:mm:ss，可包含 DD、HH、mm、ss 如 DD天 HH:mm:ss
 * @returns {string}
 * @example formatTime(3600, 'DD:HH:mm:ss') // 00:01:00:00
 * @example formatTime(3617663, 'DD天 HH:mm:ss') // 41天 15:34:23
 * @example formatTime(3617663, 'HH:mm:ss') // 1004:54:23
 */
export function formatTimeDuration(seconds: number, formatStr: string = 'HH:mm:ss'): string {
  const units = ['DD', 'HH', 'mm', 'ss']
  const conversions = [24 * 60 * 60, 60 * 60, 60, 1]
  let remainingSeconds = seconds
  let formattedTime = formatStr

  for (let i = 0; i < units.length; i++) {
    const unit = units[i]
    const conversion = conversions[i]

    // 替换 formatStr 中的单位
    formattedTime = formattedTime.replace(new RegExp(unit, 'g'), () => {
      const value = Math.floor(remainingSeconds / conversion)
      remainingSeconds -= value * conversion
      return value.toString().padStart(2, '0')
    })
  }

  return formattedTime
}

export const useCountdown = (endTime: Ref<string> | string, options?: CountdownHookOptions): CountdownHook => {
  const countdownSeconds = ref(0)
  const format = options?.format ?? 'HH:mm:ss'
  const countdownTime = computed(() => {
    if (typeof format === 'function') {
      return format(countdownSeconds.value)
    }
    return formatTimeDuration(countdownSeconds.value, format)
  })
  let timeoutId: NodeJS.Timeout | null = null
  let endCallback = () => {}

  const calculateCountdown = () => {
    const targetTime =
      typeof endTime === 'string'
        ? new Date(endTime.replace(/-/g, '/')).getTime()
        : new Date(endTime?.value?.replace(/-/g, '/')).getTime()
    const currentTime = new Date().getTime()
    const diff = Math.max(0, targetTime - currentTime)
    countdownSeconds.value = Math.floor(diff / 1000)

    if (diff === 0 && timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
      endCallback?.()
    } else {
      // 下一个整数秒的时间差 000ms
      const nextInterval = Math.ceil(new Date().getTime() / 1000) * 1000 - new Date().getTime()
      timeoutId = setTimeout(calculateCountdown, nextInterval)
    }
  }

  const pauseCountdown = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  const resumeCountdown = () => {
    if (!timeoutId) {
      calculateCountdown()
    }
  }

  // 监听 endTime 的变化
  if (typeof endTime !== 'string') {
    watch(endTime, () => {
      pauseCountdown() // 暂停当前的倒计时
      calculateCountdown() // 重新计算倒计时
    })
  }

  // 在组件 unmount 时取消计时器
  onUnmounted(() => {
    pauseCountdown()
  })

  calculateCountdown()

  const onCountdownEnd = (callback: () => void) => {
    endCallback = callback
  }

  return {
    countdownTime,
    countdownSeconds,
    pauseCountdown,
    resumeCountdown,
    onCountdownEnd,
    stopCountdown: pauseCountdown
  }
}
