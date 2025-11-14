/** 获取调用栈 */
export const getStack = () => {
  const error = new Error()
  const stack = error.stack!.split('\n')
  // 堆栈的第三行包含了调用该函数的信息
  // 如果你在函数外部调用这个函数，它可能是第四行
  const callerLine = stack[3].trim()
  // 通过正则表达式从堆栈信息中提取模块路径、行号和列号
  const match = callerLine.match(/\((.*):(\d+):(\d+)\)$/)
  if (match) {
    let modulePath = match[1]
    let lineNumber = match[2]
    let columnNumber = match[3]
    // 删除 webpack-internal:/// 前缀
    modulePath = modulePath.replace('webpack-internal:///', '')
    return `(${modulePath}:${lineNumber}:${columnNumber})`
  }
  return null
}
