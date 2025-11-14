import dayjs from 'dayjs'

// 获取指定天数后的时间
export const getDaysLater = (days: number) => {
  // 使用 dayjs 添加天数
  const newDate = dayjs().add(days, 'day')
  // 格式化输出
  return newDate.format('YYYY-MM-DD HH:mm:ss')
}
