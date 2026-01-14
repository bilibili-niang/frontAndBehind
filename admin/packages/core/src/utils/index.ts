export * from './image-process'
export * from './download'
export { default as emitter } from './emitter'
export * from './test'
export * from './uuid'
export * from './date'

/** 将 html 转成文本 */
export const getSimpleText = (html: string) => {
  if (!html) {
    return html
  }
  const re1 = new RegExp('<.+?>', 'g') // 匹配html标签的正则表达式，"g"是搜索匹配多个符合的内容
  const msg = html.replace(re1, '') // 执行替换成空字符
  return msg
}

export const getOptionLabel = (options: { label: string; value: any }[], value: any) => {
  return (Array.isArray(options) ? options : []).find((item) => {
    return item?.value == value
  })?.label
}
