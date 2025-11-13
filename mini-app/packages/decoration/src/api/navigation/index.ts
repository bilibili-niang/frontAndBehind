import { request } from '@anteng/core'

// 装修导航列表
export const $navigationList = (params: any) => {
  return request({
    url: '/api/navigation/list',
    params,
    method: 'get'
  })
}

// 创建装修导航
export const $createNavigation = (data: any) => {
  return request({
    url: '/api/navigation/create',
    data,
    method: 'post'
  })
}

// 更新装修导航（RESTful：通过路径参数携带 id）
export const $updateNavigation = (id: string, data: any) => {
  return request({
    url: `/api/navigation/${id}`,
    data,
    method: 'put'
  })
}

// 删除装修导航
export const $deleteNavigation = (id: string) => {
  return request({
    url: '/api/navigation/delete',
    params: { id },
    method: 'delete'
  })
}

// 装修导航详情
export const $getNavigationDetail = (id: string) => {
  return request({
    url: '/api/navigation/detail',
    params: { id },
    method: 'get'
  })
}