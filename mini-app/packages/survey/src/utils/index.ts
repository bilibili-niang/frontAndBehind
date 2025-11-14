/** 输入类型：不限类型（不做校验） */
export const INPUT_TYPE_NONE = ''
/** 输入类型：数字 */
export const INPUT_TYPE_NUMBER = 'number'
/** 输入类型：日期 */
export const INPUT_TYPE_DATE = 'date'
/** 输入类型：时间 */
export const INPUT_TYPE_TIME = 'time'
/** 输入类型：电子邮箱 */
export const INPUT_TYPE_EMAIL = 'email'
/** 输入类型：中文 */
export const INPUT_TYPE_CHINESE = 'chinese'
/** 输入类型：英文 */
export const INPUT_TYPE_ENGLISH = 'english'
/** 输入类型：网址 */
export const INPUT_TYPE_URL = 'url'
/** 输入类型：身份证号码（中国大陆） */
export const INPUT_TYPE_IDENTITY = 'identity'
/** 输入类型：手机号码（中国大陆） */
export const INPUT_TYPE_PHONE = 'phone'
/** 输入类型选项 */
export const INPUT_TYPE_OPTIONS = [
  { label: '不限类型', value: INPUT_TYPE_NONE, validate: (v: string) => true },
  {
    label: '数字',
    value: INPUT_TYPE_NUMBER,
    validate: (v: string) => /^[0-9]+$/.test(v)
  },
  {
    label: '日期',
    value: INPUT_TYPE_DATE,
    formatter: 'YYYY-MM-DD，例如：2024-01-01',
    validate: (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) // 日期格式 YYYY-MM-DD
  },
  {
    label: '时间',
    value: INPUT_TYPE_TIME,
    formatter: 'HH:mm 或 HH:mm:ss，例如：12:00',
    validate: (v: string) => /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/.test(v) // 时间格式 HH:mm 或 HH:mm:ss
  },
  {
    label: '电子邮箱',
    value: INPUT_TYPE_EMAIL,
    validate: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
  },
  {
    label: '中文',
    value: INPUT_TYPE_CHINESE,
    validate: (v: string) => /^[\u4e00-\u9fa5]+$/.test(v) // 仅中文字符
  },
  {
    label: '英文',
    value: INPUT_TYPE_ENGLISH,
    validate: (v: string) => /^[a-zA-Z]+$/.test(v) // 仅英文字符
  },
  {
    label: '网址/链接',
    value: INPUT_TYPE_URL,
    validate: (v: string) => /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/.test(v)
  },
  {
    label: '身份证号码(中国大陆)',
    value: INPUT_TYPE_IDENTITY,
    validate: (v: string) => /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/.test(v) // 中国大陆身份证号码格式
  },
  {
    label: '手机号码(中国大陆)',
    value: INPUT_TYPE_PHONE,
    validate: (v: string) => /^1[3-9]\d{9}$/.test(v) // 中国大陆手机号码格式
  }
]

export const getTextValueValidator = (type: string) => INPUT_TYPE_OPTIONS.find(item => item.value === type)
export const validateTextValue = (value: string, type?: string) => {
  if (!type) return true
  const option = INPUT_TYPE_OPTIONS.find(item => item.value === type)
  if (!option) return true
  return option?.validate?.(value) ?? true
}
