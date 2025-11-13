// 生成今天的年月日时间格式字符串
export const getToday = (date: Date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0') // 月份从0开始，所以需要加1
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}
