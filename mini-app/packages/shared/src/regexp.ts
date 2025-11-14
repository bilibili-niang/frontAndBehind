/**
 * 验证手机格式
 */
function mobile(value: string): boolean {
  return /^1[23456789]\d{9}$/.test(value)
}

/**
 * 是否短信验证码
 */
function code(value: string, len: number | string = 6): boolean {
  return new RegExp(`^\\d{${len}}$`).test(value)
}

/** 是否身份证号码 */
const identity = (value: string) => {
  return /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[1-2]\d|3[0-1])\d{3}([0-9Xx])$/.test(value)
}

const test = {
  mobile,
  code,
  identity
}

export default test
