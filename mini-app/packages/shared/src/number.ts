export function numberToChinese(num: number): string {
  if (num === 0) return '零'

  const units = ['', '十', '百', '千']
  const bigUnits = ['', '万', '亿']
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']

  let result = ''
  const numStr = num.toString()
  const numLength = numStr.length

  // 处理每四位数
  for (let i = 0; i < numLength; i++) {
    const currentNum = Number(numStr[i])
    const position = numLength - i - 1
    const unitIndex = position % 4
    const bigUnitIndex = Math.floor(position / 4)

    if (currentNum !== 0) {
      result += digits[currentNum] + units[unitIndex]
    } else {
      if (result[result.length - 1] !== '零') {
        result += '零'
      }
    }

    // 添加大单位（万、亿）
    if (unitIndex === 0 && position !== 0) {
      result = result.replace(/零+$/, '') + bigUnits[bigUnitIndex]
    }
  }

  // 移除末尾的零
  result = result.replace(/零+$/, '')
  // 替换多个零为一个零
  result = result.replace(/零+/g, '零')

  // 处理十几的情况，如 "十一" 而不是 "一十"
  if (result.startsWith('一十')) {
    result = result.substring(1)
  }

  return result
}
