export * from './order'

/** 组件库类名前缀 */
export const PREFIX_CLS = 'anteng'

export const withPrefix = (text: string) => `${PREFIX_CLS}-${text}`

/** 默认 logo 图标 */
export const LOGO_URL = 'https://dev-cdn.anteng.cn/upload/b3488689043533a61d23db9c688596ea.png'

/** 默认用户头像，未登录,未设置时使用 */
export const DEFAULT_AVATAR = '/defaultAvatar.png'

/** 应用场景：也宋 */
export const SCENE_YESONG = 'yesong'
// TODO 忘了这个变量是干什么的了
export const SCOPE_SU = 'su'

/** 通用状态：禁用 */
export const COMMON_STATUS_OFF = 0
/** 通用状态：启用 */
export const COMMON_STATUS_ON = 1
/** 通用状态选项 */
export const COMMON_STATUS_OPTIONS = [
  { label: '禁用', value: COMMON_STATUS_OFF },
  { label: '启用', value: COMMON_STATUS_ON }
]

/** 颜色 蓝色：加载中,进程中,待办 */
export const COLOR_PROCESSING = '#1677ff'
/** 颜色 绿色：成功 */
export const COLOR_SUCCESS = '#27ae60'
/** 颜色 红色：失败 */
export const COLOR_ERROR = '#eb2f06'
/** 颜色 黄色：警告 */
export const COLOR_WARNING = '#f1c40f'
/** 颜色 灰色：禁用,关闭,失效,不可预约,未使用 */
export const COLOR_DISABLED = '#c4c6ca'

/**
 * 腾讯地图key
 * 需要在环境变量中配置 VITE_TENCENT_MAP_KEY
 * 申请地址：https://lbs.qq.com/console/mykey.html
 */
export const TENCENT_MAP_KEY = import.meta.env.VITE_TENCENT_MAP_KEY || ''

/**
 * TinyMCE 富文本编辑器 API Key
 * 需要在环境变量中配置 VITE_TINYMCE_API_KEY
 * 申请地址：https://www.tiny.cloud/my-account/dashboard/
 * 注意：如果使用自托管版本可以不配置此项
 */
// export const TINYMCE_API_KEY = import.meta.env.VITE_TINYMCE_API_KEY || ''

/** 支付渠道：微信直连 */
export const PAY_CHANNEL_WECHAT_PAY = 0
/** 支付渠道：微信服务商 */
export const PAY_CHANNEL_WECHAT_MERCHANT = 1
/** 支付渠道：云闪付（通联支付） */

export const PAY_CHANNEL_OPTIONS = [
]

export * from './payment'
export * from './src/colors'

// 导航栏的一些状态
export * from './src/navigation'

export * from './src/user'