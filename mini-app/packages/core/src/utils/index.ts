import Taro from '@tarojs/taro'
export * from './navigator'

/** 拨打电话 */
export const makePhoneCall = (phone: string) => {
  Taro.makePhoneCall({
    phoneNumber: phone
  })
}

// 定义安全解析函数
export function safeParse(jsonString, defaultValue = {}) {
  // 检查输入是否为 null
  if (jsonString === null) {
    console.warn('Invalid input: null. Expected a string or an object.')
    return defaultValue
  }

  // 检查输入是否为对象（非 null 对象）
  if (typeof jsonString === 'object' && jsonString !== null) {
    return jsonString
  }

  // 检查输入是否为字符串
  if (typeof jsonString !== 'string') {
    console.warn(`Invalid input type: ${typeof jsonString}. Expected a string or an object.`)
    return defaultValue
  }

  try {
    // 尝试解析 JSON 字符串
    const parsedValue = JSON.parse(jsonString)

    // 如果解析成功，返回解析后的对象
    return parsedValue
  } catch (error) {
    // 捕获并记录解析错误
    console.error(`Error parsing JSON: ${error.message}`)
    return defaultValue
  }
}

/**
 * 距离转换
 * 将输入的距离值转换为友好的显示格式。接受数字或可转换为数字的字符串输入，单位为米（m）。
 * 距离小于1千米时，结果以米为单位并四舍五入到整数；距离大于等于1千米时，转换为公里（km）并四舍五入到小数点后两位。
 *
 * @param {number | string} dis - 输入的距离值，可以是数字或可转换为数字的字符串，单位为米。
 * @returns {string} - 转换后的距离字符串，格式化为米或公里。
 *
 * @example
 * computedDistance(500); // 返回: "500m"
 * computedDistance("1234.56"); // 返回: "1.23km"
 */
export function computedDistance(dis: number | string): string {
  const distance = typeof dis === 'string' ? parseFloat(dis) : dis
  if (isNaN(distance)) {
    return ' '
  }
  return distance < 1000 ? `${Math.round(distance)}m` : `${Math.round(distance) / 1000}km`
}

/**
 * 判断是否object实例
 * @param target 任意对象
 */
export function isObject(target: any) {
  return target !== null && (typeof target === 'object' || typeof target === 'function') && !Array.isArray(target)
}

/**
 * 判断是否为空对象
 * @param target 任意对象
 */
export function isEmptyObject(target: any) {
  return isObject(target) && Object.keys(target).length === 0
}