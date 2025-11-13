import { request } from '@anteng/core'

// 系统页面列表（分页）
export const $systemPageList = (params: any) => {
  return request({
    url: '/api/system-page/list',
    params,
    method: 'get'
  })
}

// 创建系统页面
export const $createSystemPage = (data: any) => {
  return request({
    url: '/api/system-page/create',
    data,
    method: 'post'
  })
}

// 更新系统页面（RESTful：通过路径参数携带 id）
export const $updateSystemPage = (id: string, data: any) => {
  return request({
    url: `/api/system-page/update/${id}`,
    data,
    method: 'put'
  })
}

// 删除系统页面
export const $deleteSystemPage = (id: string) => {
  return request({
    url: '/api/system-page/delete',
    params: { id },
    method: 'delete'
  })
}

// 系统页面详情
export const $getSystemPageDetail = (id: string) => {
  return request({
    url: '/api/system-page/detail',
    params: { id },
    method: 'get'
  })
}