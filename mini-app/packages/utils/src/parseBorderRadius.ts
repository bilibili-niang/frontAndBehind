/**
 * 解析圆角计算值
 * @param value
 * @returns {[number, number, number, number]} [number, number, numebr, number]
 */
export default function parseBorderRadius(value: number | number[] | string) {
  if (typeof value === 'number') {
    return [value, value, value, value]
  } else if (Array.isArray(value) && value.length > 0) {
    if (value.length === 1) {
      return Array(4).fill(value[0])
    } else if (value.length === 2) {
      return [...value, ...value]
    } else if (value.length === 3) {
      return [value[0], value[1], value[2], value[1]]
    }
    return value.slice(0, 4)
  } else if (typeof value === 'string') {
    return parseBorderRadius(value.match(/\d+/g)?.map(Number) as number[])
  } else {
    return [0, 0, 0, 0]
  }
}
