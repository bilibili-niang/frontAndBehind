// 传入a,b,将a中的值覆盖为b的值,两个都是对象
export const merge = (a: any, b: any) => {
  // 创建一个新的对象用于存放结果
  const result = {}
  // 使用 Object.prototype.hasOwnProperty.call 避免直接访问对象的 hasOwnProperty 方法
  for (const key in a) {
    if (Object.prototype.hasOwnProperty.call(a, key) && Object.prototype.hasOwnProperty.call(b, key)) {
      result[key] = b[key]
    }
  }
  return result
}
