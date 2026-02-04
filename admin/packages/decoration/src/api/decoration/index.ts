import { request } from '@pkg/core'

// 获取装修页面列表（接入后端系统页面分页接口）
export const $decorationList = (params: any) => {
  return request({
    url: '/api/decorate/customize/list',
    params,
    method: 'GET'
  })
}

// 创建自定义装修页面
export const $createDecorationPage = (data: any) => {
  return request({
    url: '/api/decorate/customize/create',
    data,
    method: 'POST'
  })
}

// 更新自定义装修页面
export const $updateDecorationPage = (id: string, data: any) => {
  return request({
    url: `/api/decorate/customize/update/${id}`,
    data,
    method: 'PUT'
  })
}

// 删除自定义装修页面
export const $deleteDecorationPage = (id: string) => {
  return request({
    url: '/api/decorate/customize/delete',
    params: { id },
    method: 'DELETE'
  })
}

// 获取自定义装修页面详情
export const $getDecorationPageDetail = (id: string) => {
  return request({
    url: '/api/decorate/customize/detail',
    params: { id },
    method: 'GET'
  })
}