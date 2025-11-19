import request, { REQUEST_DOMAIN } from '../request'
import { ORIGIN_STORE } from '@anteng/config'

/** 获取首页底部导航栏数据 */
const requestGetIndexTabs = () => {
  return request({
    baseURL: REQUEST_DOMAIN,
    url: '/navigation/actived',
    method: 'get',
    params: {
      origin: ORIGIN_STORE
    }
  })
}

export default requestGetIndexTabs
