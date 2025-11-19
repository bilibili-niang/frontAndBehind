import request, { REQUEST_DOMAIN } from '../request'

/** 获取系统页面详情（首页等），按传入 key/scene 返回装修数据 */
const getIndexPage = (key: string, scene: string) => {
  return request({
    baseURL: REQUEST_DOMAIN,
    url: '/decorate/system/detail',
    method: 'get',
    params: { key, scene }
  })
}

export default getIndexPage
