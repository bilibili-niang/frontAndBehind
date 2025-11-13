import request from '../request'

export const $shopList = (params: any) => {
  return request({ url: '/api/shop/list', method: 'get', params })
}

export const $shopCreate = (data: any) => {
  return request({ url: '/api/shop/create', method: 'post', data })
}

export const $shopUpdate = (id: string, data: any) => {
  return request({ url: `/api/shop/update/${id}`, method: 'put', data })
}

export const $shopDelete = (id: string) => {
  return request({ url: '/api/shop/delete', method: 'delete', params: { id } })
}