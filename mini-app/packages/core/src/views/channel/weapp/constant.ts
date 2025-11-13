export const PRINCIPAL_TYPE_OPTIONS = [
  { value: 0, label: '个人' },
  { value: 1, label: '企业' },
  { value: 2, label: '媒体' },
  { value: 3, label: '政府' },
  { value: 4, label: '其他组织' }
]

export const CUSTOMER_TYPE_OPTIONS = [
  { value: 1, label: '企业' },
  { value: 2, label: '企业媒体' },
  { value: 3, label: '政府' },
  { value: 4, label: '非盈利组织' },
  { value: 5, label: '民营非企业' },
  { value: 6, label: '盈利组织' },
  { value: 8, label: '社会团体' },
  { value: 9, label: '事业媒体' },
  { value: 11, label: '事业单位' },
  { value: 12, label: '个体工商户' },
  { value: 14, label: '海外企业' },
  { value: 15, label: '个人' }
]

export const REALNAME_STATUS_OPTIONS = [
  { value: 1, label: '实名验证成功' },
  { value: 2, label: '实名验证中' },
  { value: 3, label: '实名验证失败' }
]

/** 小程序版本：关闭 */
export const WEAPP_VERSION_STATUS_CLOSED = 0
/** 小程序版本：已发布 */
export const WEAPP_VERSION_STATUS_RELEASED = 1
/** 小程序版本：体验版 */
export const WEAPP_VERSION_STATUS_TRIAL = 2
/** 小程序版本：审核中 */
export const WEAPP_VERSION_STATUS_AUDITING = 3
/** 小程序版本：审核已通过 */
export const WEAPP_VERSION_STATUS_ACCESS = 4
