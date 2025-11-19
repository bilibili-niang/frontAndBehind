export { default as uuid } from './src/uuid'

export { default as parseBorderRadius } from './src/parseBorderRadius'

export { default as withUnit, formatHtmlUnit } from './src/withUnit'

export { default as test } from './src/regexp'

import formatPrice from './src/formatPrice'

export * from './src/date'
export * from './src/debug'
export * from './src/render'
export * from './src/map'
export * from './src/text'
export * from './src/color'
export * from './src/number'
export * from './src/file'
export * from './src/formatPrice'

export { default as jsonpAdapter } from './src/axios-jsonp'

export { formatPrice }

/** 手机号脱敏中间四位数 */
export const encryptPhoneNumber = (phone: string = '') => {
  try {
    const reg = /(\d{3})\d{4}(\d{4})/
    return phone.replace(reg, '$1****$2')
  } catch (err) {
    return ''
  }
}

/**
 * 根据索引返回字母序号（A, B, ..., Z, AA, AB, ...）
 */
export const getIndexLabel = (index: number): string => {
  const base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let n = index
  let label = ''
  do {
    label = base[n % 26] + label
    n = Math.floor(n / 26) - 1
  } while (n >= 0)
  return label
}
