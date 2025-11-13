import dayjs, { Dayjs } from 'dayjs'

/**
 * 计算出两个日期之间的完整日期列表
 * 格式 YYYY-MM-DD
 */
export function generateDateRange(startDate: string, endDate: string): string[] {
  const start = dayjs(startDate)
  const end = dayjs(endDate)

  // 确保 startDate 永远是最小日期
  const rangeStart = start.isBefore(end) ? start : end
  const rangeEnd = start.isBefore(end) ? end : start

  const dates: string[] = []

  // 从 rangeStart 到 rangeEnd 按天递增生成日期
  let currentDate = rangeStart
  while (currentDate.isBefore(rangeEnd) || currentDate.isSame(rangeEnd, 'day')) {
    dates.push(currentDate.format('YYYY-MM-DD'))
    currentDate = currentDate.add(1, 'day')
  }

  return dates
}

const weekDayMap: Record<number, string> = {
  0: '周日',
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六'
}

/** 获取星期，可传入 0 - 6 数字 或 具体日期 */
export const getWeekDay = (day: number | string | Dayjs) => {
  if (typeof day === 'string') {
    if (/^\d+$/.test(day)) {
      return weekDayMap[Number(day)] || ''
    }
    return weekDayMap[dayjs(day).day()]
  } else if ((day as Dayjs)?.day) {
    return weekDayMap[(day as Dayjs).day()] || ''
  }
  return weekDayMap[day as number] || ''
}
