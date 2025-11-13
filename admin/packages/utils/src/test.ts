import dayjs from 'dayjs'

/** 校验日期 YYYY-MM-DD 格式 */
export const validateDate = (dateStr: string) => {
  if (!/^(19|20)\d\d[-](0[1-9]|1[012])[-](0[1-9]|[12][0-9]|3[01])$/.test(dateStr)) {
    return false
  }
  return dayjs(dateStr, 'YYYY-MM-DD', true).isValid()
}

/**
 * 验证给定的字符串是否为有效的电子邮件地址。
 *
 * @param email 要验证的电子邮件地址
 * @returns 如果是有效电子邮件地址返回true，否则返回false
 */
export const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * 验证给定的字符串是否为中国大陆的银行卡号。
 *
 * @param cardNumber 要验证的银行卡号
 * @returns 如果是有效银行卡号返回true，否则返回false
 */
export const validateBankCardNumber = (cardNumber: string) => {
  return /^([1-9]{1})(\d{15}|\d{18})$/.test(cardNumber)
}

/**
 * 验证给定的字符串是否可以表示一个合法的金额数字。
 *
 * @param amountStr 要验证的金额字符串
 * @returns 如果是合法的金额数字返回true，否则返回false
 */
export const validateAmount = (amountStr: any) => {
  // 正则表达式匹配合法的金额格式，包括正负号、数字以及小数点
  // 小数点后至少需要有一位数字，整体数字长度至少为1
  return /^-?\d+(\.\d+)?$/.test(amountStr)
}
