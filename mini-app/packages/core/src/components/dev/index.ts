// 测试环境打断点用的,可以不传入方法
export const isDev = (fun?: Function) => {
  const flag = process.env.NODE_ENV === 'development'
  if (flag) {
    typeof fun === 'function' ? fun?.() : fun
  }
  return flag
}
