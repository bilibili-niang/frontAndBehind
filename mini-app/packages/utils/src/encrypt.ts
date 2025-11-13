/** 身份证号脱敏 */
export function encryptIdNumber(idNumber: string) {
  if (typeof idNumber !== 'string') return ''
  if (idNumber.includes('*')) return idNumber
  if (idNumber.length === 18) {
    return idNumber.slice(0, 6) + '********' + idNumber.slice(-4)
  } else {
    return idNumber.slice(0, 6) + '******' + idNumber.slice(-4)
  }
}
