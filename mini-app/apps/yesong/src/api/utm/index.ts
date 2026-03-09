import request from '../request'

// 生成短链码
export const $shortLink = (data: object) => {
  return request({
    url: '/ice-cornerstone-system/short-url',
    method: 'POST',
    withLocation: true,
    data
  })
}

// 获取短链码
export const $getShortLink = (code: string) => {
  return request({
    url: `/ice-cornerstone-system/short-url/origin/${code}`
  })
}
