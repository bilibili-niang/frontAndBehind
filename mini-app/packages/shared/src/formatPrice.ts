/** 格式化价格，最多保留2位小数 */
const formatPrice = (value: string | number): string => {
  if (value === null || value === undefined) return ''

  const v = Math.round(Number(value) * 100) / 100

  if (Number.isNaN(v)) return ''

  const [integer, decimal] = String(v).split('.')

  if (!decimal) return integer

  return [integer, decimal.slice(0, 2).replace(/0$/, '').replace(/0$/, '')].join('.').replace(/\.$/, '')
}

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

export default formatPrice
