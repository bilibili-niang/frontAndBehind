// 分转元
export const moneyToYuan = (value: string | number): number => {
  let numValue: number
  if (typeof value === 'string') {
    numValue = parseFloat(value)
    // 检查转换是否成功，并且转换后的值是一个有限的数字
    if (isNaN(numValue) || !isFinite(numValue)) {
      throw new Error('Invalid input: the value must be a valid number.')
    }
  } else {
    numValue = value
  }
  return numValue / 100
}
// 元转分
export const moneyToFen = (value: number) => {
  if (!value) return 0
  return Math.round(value * 100)
}
