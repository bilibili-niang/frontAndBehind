import { parseLink } from '../../../utils'
import { navigateToWebview } from '../../../router'

export interface ActionConfigH5 {
  /** 链接（可带查询参数） */
  url: string
  /** 查询参数 */
  params: Record<string, string>[]
  /** 需要单点登录 */
  needSSO: boolean
}

const useLink = (link: string) => {
  if (process.env.TARO_ENV === 'h5') {
    window.location.href = link
  } else {
    navigateToWebview(link)
  }
}

export default {
  key: 'h5',
  title: '打开H5链接',
  handler: (config: ActionConfigH5) => {
    const params = {}
    config.params?.forEach(item => (params[item.key] = item.value))
    const link = parseLink(config.url, params)
    useLink(link)
  }
}
