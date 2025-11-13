

/** 页面是首页 */
export const PAGE_IS_HOMEPAGE = 1

/** 自定义页面 */
export const SCOPE_CUSTOM = 'custom'
/** 登录页 */
export const SCOPE_LOGIN = 'login'
/** 个人中心 */
export const SCOPE_PROFILE = 'profile'
/** 搜索页 */
export const SCOPE_SEARCH = 'search'
/** 启动页 */
export const SCOPE_LAUNCH = 'launch'
/** 文旅景区详情 */
export const TOURISM_SCENERY_DETAIL = 'scenery-detail'

/** 自定义页面模板：默认 */
export const PAGE_TEMPLATE_DEFAULT = 'default'
/** 自定义页面模板：文旅地图页 */
export const PAGE_TEMPLATE_TOURISM_MAP = 'tourism-map'

export const TEMPLATE_OPTIONS = [
  { label: '默认', value: PAGE_TEMPLATE_DEFAULT, pkg: 'custom-page', default: null },
  { label: '文旅地图', value: PAGE_TEMPLATE_TOURISM_MAP, pkg: 'tourism-map', default: null }
]
