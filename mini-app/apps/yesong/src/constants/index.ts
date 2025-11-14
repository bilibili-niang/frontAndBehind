export * from './main-tab'
export * from './order'
export * from './goods'
export * from './express'
export * from './coupon'
export * from './balasceType'
export * from './share'

/** 通用状态：禁用 */
export const COMMON_STATUS_OFF = 0
/** 通用状态：启用 */
export const COMMON_STATUS_ON = 1
/** 通用状态选项 */
export const COMMON_STATUS_OPTIONS = [
  { label: '禁用', value: COMMON_STATUS_OFF },
  { label: '启用', value: COMMON_STATUS_ON }
]
