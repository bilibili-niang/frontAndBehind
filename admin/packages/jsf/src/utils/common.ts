/**
 * 判断是否object实例
 * @param target 任意对象
 */
export function isObject(target: any) {
  return target !== null && (typeof target === 'object' || typeof target === 'function') && !Array.isArray(target)
}

/**
 * 判断对象上是否存在某个属性
 * @param target 任意对象
 * @param key 需要检测的key
 */
export function hasOwnProperty(target: any, key: string) {
  return Object.prototype.hasOwnProperty.call(target, key)
}

/**
 * 判断是否为空对象
 * @param target 任意对象
 */
export function isEmptyObject(target: any) {
  return isObject(target) && Object.keys(target).length === 0
}

/**
 * 判断是否vue3组件
 * @param target
 */
export function isVueComponent(target: any) {
  // TODO 优化Vue3组件判断，这里可能存在问题
  return (
    typeof target === 'function' ||
    (isObject(target) &&
      (typeof target.render === 'function' ||
        typeof target.setup === 'function' ||
        typeof target.template === 'string'))
  )
}

/**
 * 属性排序，如果 order 不是一个数组，返回默认值
 * ***
 * order 中可以使用通配符 * 表示未被明确指定的剩余属性，[a, b, c, d], [a, *, c] => [a, b, d, c]
 * ***
 * 如果没有指定通配符 * ，默认在order末尾追加
 * ***
 * @param properties - 将被排序的属性列表
 * @param order - 排序顺序
 * @returns - 正确排序列表
 * @throws - 无法被正确排序，返回默认值
 */
export function orderProperties(properties: string[], order?: string[]): string[] {
  if (!Array.isArray(order)) {
    return properties
  }
  order = order.slice(0)
  if (!order.includes('*')) {
    order.push('*')
  }
  const arrayToHash = (arr: string[]) =>
    arr.reduce(
      (prev, curr) => {
        prev[curr] = true
        return prev
      },
      {} as {
        [key: string]: any
      }
    )
  const errorPropList = (arr: string[]) =>
    arr.length > 1 ? `properties '${arr.join("', '")}'` : `property '${arr[0]}'`
  const propertyHash = arrayToHash(properties)
  const orderFiltered = order.filter((prop) => prop === '*' || propertyHash[prop])
  const orderHash = arrayToHash(orderFiltered)

  const rest = properties.filter((prop: string) => !orderHash[prop])
  const restIndex = orderFiltered.indexOf('*')
  if (restIndex === -1) {
    if (rest.length) {
      console.error(`orders 不包含 ${errorPropList(rest)}`)
    }
    return orderFiltered
  }
  if (restIndex !== orderFiltered.lastIndexOf('*')) {
    console.error('orders 最多只能包含一个通配符 *')
  }
  const complete = [...orderFiltered]
  complete.splice(restIndex, 1, ...rest)
  return complete
}
