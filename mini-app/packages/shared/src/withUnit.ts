import Taro from '@tarojs/taro'

/** 将数值转化成 px */
export default (value: number, target = 375) => {
  return Taro.pxTransform(value * (375 / target))
}

export const formatHtmlUnit = (htmlString: string) => {
  return htmlString?.replace?.(/([:|\s(]+)([-+]?\d*\.?\d+)(px)/g, (match, prefix, value) => {
    return `${prefix}${Taro.pxTransform(value)}`
  })
}
