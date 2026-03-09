
/** 腾讯地图key */
export const TENCENT_MAP_KEY = ''

/** 腾讯地图应用来源 */
export const TENCENT_MAP_REFERER = 'ice'

/** 默认用户头像，未登录、未设置时使用 */
export const DEFAULT_AVATAR = '/defaultAvatar.png'

/** 通用状态：禁用 */
export const COMMON_STATUS_OFF = 0
/** 通用状态：启用 */
export const COMMON_STATUS_ON = 1
/** 通用状态选项 */
export const COMMON_STATUS_OPTIONS = [
  { label: '禁用', value: COMMON_STATUS_OFF },
  { label: '启用', value: COMMON_STATUS_ON }
]

/** 颜色 蓝色：加载中、进程中、待办 */
export const COLOR_PROCESSING = '#1677ff'
/** 颜色 绿色：成功 */
export const COLOR_SUCCESS = '#27ae60'
/** 颜色 红色：失败 */
export const COLOR_ERROR = '#eb2f06'
/** 颜色 黄色：警告 */
export const COLOR_WARNING = '#f1c40f'
/** 颜色 灰色：禁用、关闭、失效 */
export const COLOR_DISABLED = '#c4c6ca'

/** 性别：女性 */
export const GENDER_FEMALE = 0
/** 性别：男性 */
export const GENDER_MALE = 1
export const EXPRESS_COMPANY_OPTIONS = []
export const DIRECT_WEAPP_OPTIONS = []

export const PAYMENT_METHOD_NONE = 0
export const SUB_PAYMENT_METHOD_OPTIONS = 0

/** 支付渠道：余额支付 */
export const PAYMENT_CHANNEL_BALANCE = 'UserAccount'

// 也宋小程序
export const ORIGIN_STORE = 'yesong'
export * from './order'

export const PAYMENT_METHOD_VALUE_CARD = 0