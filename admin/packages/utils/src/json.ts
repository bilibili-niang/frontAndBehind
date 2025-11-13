export function safeParse(input: any) {
  if (typeof input === 'string') {
    try {
      return JSON.parse(input)
    } catch (error) {
      console.error('解析JSON字符串时发生错误:', error)
      return {} // 或者返回默认值、或者抛出错误
    }
  } else if (typeof input === 'object') {
    return input
  } else {
    console.error('输入既不是对象也不是字符串')
    return {} // 或者返回默认值、或者抛出错误
  }
}
