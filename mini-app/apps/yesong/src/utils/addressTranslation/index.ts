// 地址转换相关逻辑
const citiesJson = require('./cities.json')

/**
 * 递归查找地址对应code 返回值里的 children 可能会存在
 * @param {string} address 地址
 * @param data 数据源
 * @returns  {code: string, value: string, label: string,children?: [code: string, value: string, label: string]}
 *
 */
export const addressTranslationToCode = (address: string | undefined | null, data = citiesJson) => {
  if (!address) {
    // throw new Error('地址不能为空')
    console.error('地址不能为空,当前地址是:', address)
    return null
  }
  for (const item of data) {
    if (item.label === address) {
      return item
    }
    if (item.children) {
      const result = addressTranslationToCode(address, item.children)
      if (result) {
        return result
      }
    }
  }
  return null // 未找到匹配
}
/*
 * 通过code查找到它对应的子项,这里的children最多有二级
 * */
export const findItemByCode = (code, data = citiesJson) => {
  if (!data || !Array.isArray(data)) return null

  for (const item of data) {
    // 找到匹配的 code 直接返回
    if (item.code === code) {
      return item
    }

    // 如果有 children 并且是数组，则递归查找
    if (Array.isArray(item.children)) {
      const foundItem = findItemByCode(code, item.children)
      if (foundItem !== null) {
        return foundItem
      }
    }
  }

  // 如果遍历完所有项都没有找到匹配的 code，则返回 null
  return null
}
/**
 * 判断用户传入的区域code是否在允许的区域中
 */
export const checkAreaCodeInSide = (areaCode: string, allowAreaCode: string) => {
  // 如果允许的区域为空，则直接返回false, 表示不允许
  if (!allowAreaCode) {
    return false
  }
  // 递归获取children的code
  const getChildrenCode = data => {
    if (!data) {
      return []
    }
    const codeList = []
    for (const item of data) {
      codeList.push(item.code)
      if (item.children) {
        codeList.push(...getChildrenCode(item.children))
      }
    }
    return codeList
  }
  let allowCode = []
  const allowList = findItemByCode(allowAreaCode)
  allowCode = [allowList?.code, ...getChildrenCode(allowList?.children)]
  return allowCode.includes(areaCode)
}

/*
 * 通过传入的code,返回对应的中文名称
 * */
export const getAreaNameByCode = (code, data = citiesJson) => {
  if (!code) return null

  for (const item of data) {
    if (item.code === code) return item.label
    if (item.children) {
      const label = getAreaNameByCode(code, item.children)
      if (label) return label
    }
  }

  return null
}
