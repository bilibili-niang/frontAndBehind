/**
 * 生成随机字符串
 * @param len 生成长度，默认 12
 * @param radix [0-9][A-Z][a-z] 基数长度，默认 完整长度
 * @returns
 */
export const uuid = (len = 12, radix?: number) => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
  const list = []
  radix = radix || chars.length
  for (let i = 0; i < len; i++) list[i] = chars[0 | (Math.random() * radix)]
  return list.join('')
}

export default uuid
