/**
 * 将分转换为元和分
 *
 * @param value 数值或字符串形式的数值，表示分
 * @returns 返回一个包含元、分和总金额（格式为xx.xx）的对象
 * @throws 当输入不是有效的数字时，会抛出错误
 */
export function convertFenToYuanAndFen(value: string | number): { yuan: number; fen: string; amount: string } {
  let numericValue: number
  if (typeof value === 'string') {
    // 将带有小数点的字符串转换为整数分
    numericValue = parseFloat(value) * 100
  } else {
    numericValue = value
  }

  const yuan = Math.floor(numericValue / 100)
  const fen = numericValue % 100

  // 确保分部分有两位数字，并且以字符串形式返回
  const formattedFen = fen.toString().padStart(2, '0').replace('-', '')
  return { yuan, fen: formattedFen, amount: `${yuan}.${formattedFen}` }
}
