// 翻译为英文
import request from '@/api/request'

export const $transform = async (data: object) => {
  return request({
    method: 'post',
    url: '/api/tool/translate',
    data,
  })
}