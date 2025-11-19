import request, { REQUEST_DOMAIN } from '../request'

/** 获取自定义页面装修数据 */
const getCustomPage = (id: string) => {
  return request({
    baseURL: REQUEST_DOMAIN,
    method: 'get',
    url: `/api/decorate/customize/detail?id=${id}`
  })
}

export default getCustomPage
