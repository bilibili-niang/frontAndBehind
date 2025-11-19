import dayjs from 'dayjs'

/**
 * 解析时间字符串，根据需要补全 年月日、秒，并返回对应的 Day.js 对象。
 * @param {string} timeString 时间字符串，支持格式 HH:mm:ss 或 HH:mm。
 * @returns {dayjs.Dayjs} 解析后的 Day.js 对象。
 * @example
 * console.log(safeDayjs('12:34')) // 2023-05-20 12:34:56
 * console.log(safeDayjs('12:34:56')) // 2023-05-20 12:34:56
 * console.log(safeDayjs('2023-05-20 12:34:56')) // 2023-05-20 12:34:56
 */
export const safeDayjs = (dateString: string) => {
  if (/^\d{2}:\d{2}:\d{2}$/.test(dateString) || /^\d{2}:\d{2}$/.test(dateString)) {
    const ymd = dayjs().format('YYYY-MM-DD')
    return dayjs(`${ymd} ${dateString}`)
  } else {
    return dayjs(dateString)
  }
}

/**
 * 格式化日期，默认格式为：YYYY-MM-DD HH:mm:ss
 * @param {number | string} date - 日期字符串、时间戳
 * @param {string} format - 格式
 * @returns {string} - 日期字符串
 */
export const formatDate = (date: number | string | Date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return ''
  return dayjs(date).format(format)
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

/**
 * 精简化日期文本
 * 与当前年份相同省略YYYY，秒数为 0 省略 ss
 * @param dateString 日期
 * @returns {string} 输出格式为：(YYYY-)MM-DD HH:mm(:ss)
 * @example simplifyDateString('2023-04-28 12:30:00') // 2023-04-28 12:30
 * @example simplifyDateString('2024-04-28 12:30:00') // 04-28 12:30
 */
export function simplifyDate(dateString: string): string {
  const currentDate = dayjs()
  const parsedDate = dayjs(dateString)

  // 检查给定日期的年份是否与当前年份一致
  const sameYear = currentDate.year() === parsedDate.year()
  // 秒数为 0
  const noSeconds = parsedDate.second() === 0

  if (sameYear && noSeconds) {
    return parsedDate.format('MM-DD HH:mm')
  } else if (sameYear) {
    return parsedDate.format('MM-DD HH:mm:ss')
  } else if (noSeconds) {
    return parsedDate.format('YYYY-MM-DD HH:mm')
  } else {
    // 如果不一致，则返回原始日期字符串
    return dateString
  }
}

/**
 * 更改日期分隔符
 * @param dateString 日期
 * @param separator 分隔符，默认 "/"
 * @example changeDateSeparator('2024-04-28 12:30:00') // 2024/04/28 12:30:00
 */
export function changeDateSeparator(dateString: string, separator?: '-' | '/') {
  separator = separator ?? '/'
  const s = separator === '-' ? '/' : '-'
  return dateString.replace(new RegExp(s, 'g'), separator)
}

export const isInBusinessHours = (
  businessHours: {
    periods: string[]
    weekDay: number[]
  }[]
) => {
  try {
    const now = dayjs()
    const day = now.day() // 星期
    const time = now.format('HH:mm:ss')
    // console.log(day, time)
    const rules = commonFormatPeriods(businessHours).map(item => {
      return {
        // 这里要注意，dayjs 的周日是 0，但是后端保存的周日「可能」是 7  需要 % 7
        weekDay: item.weekDay.map(w => w % 7),
        periods: item.periods
      }
    })
    return rules.some(rule => {
      // 星期命中 + 时间段命中
      return (
        rule.weekDay.includes(day) &&
        rule.periods.some(p => {
          return isInTime(p[0], p[1], time)
        })
      )
    })
  } catch (err) {
    console.log(err)
    return false
  }
}

const _formatSeconds = (time: string): number => {
  const [hour, minute, second] = time.split(':').map(Number)
  return hour * 3600 + minute * 60 + (second || 0)
}

/**
 * 计算当前时间是否在时间段内，不指定 now 则使用本地当前时间
 * 时间格式：HH:mm(:ss)
 */
export function isInTime(start: string, end: string, now?: string): boolean {
  const startTime = _formatSeconds(start)
  const endTime = _formatSeconds(end)
  const currentTime = _formatSeconds(now || dayjs().format('HH:mm:ss'))

  if (startTime <= endTime) {
    return currentTime >= startTime && currentTime <= endTime
  } else {
    return currentTime >= startTime || currentTime <= endTime
  }
}

// console.log(inTime('09:00', '14:00')) // true 或 false，取决于当前时间
// console.log(inTime('10:00:00', '10:00:00', '10:00:00')) // true

export function generateBusinessHours(list: { periods: string[]; weekDay: number[] }[]): string[] {
  return commonFormatPeriods(list).map(config => {
    const { periods, weekDay } = config
    const days = ['一', '二', '三', '四', '五', '六', '日']

    // 将 weekDay 数组按升序排序，0 代表周末，但是又从 周一起始，这里做下数值转化。。
    const sortedDays = weekDay.map(d => (d - 1 + 7) % 7).sort((a, b) => a - b)

    // 合并连续的星期
    const ranges: string[] = []
    let start = sortedDays[0]
    let end = start

    for (let i = 1; i <= sortedDays.length; i++) {
      if (i < sortedDays.length && sortedDays[i] === end + 1) {
        end = sortedDays[i]
      } else {
        if (start === end) {
          ranges.push(days[start])
        } else {
          ranges.push(`${days[start]}至${days[end]}`)
        }
        start = sortedDays[i]
        end = start
      }
    }

    const hoursList = (Array.isArray(periods[0]) ? periods : [periods]).map(item => {
      return `${item[0]}~${item[1]}`
    })
    return `周${ranges.join('、')} ${hoursList.join('、')}`
  })
}

const commonFormatPeriods = (list: any[]) => {
  try {
    return (list || []).map(item => {
      return {
        ...item,
        periods: item.periods
          .map(p => {
            if (!p) return null
            if (typeof p === 'string') {
              return p.split('-')
            } else if (Array.isArray(p)) {
              return p
            }
            return [p.startTime, p.endTime]
          })
          .filter(p => !!p)
      }
    })
  } catch (err) {
    return []
  }
}

const weekDayMap = {
  0: '周日',
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六'
}

/** 获取星期，可传入 0 - 6 数字 或 具体日期 */
export const getWeekDay = (day: number | string) => {
  if (typeof day === 'string') {
    if (/^\d+$/.test(day)) {
      return weekDayMap[Number(day)] || ''
    }
    return weekDayMap[dayjs(day).day()]
  }
  return weekDayMap[day] || ''
}
