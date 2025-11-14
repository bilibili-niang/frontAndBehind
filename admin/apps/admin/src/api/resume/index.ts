import request, { type RequestPagination } from '@/api/request'

export const $resumeList = (params: RequestPagination) => {
  const { size, current } = params
  return request({ url: '/api/resume/list', method: 'get', params: { size, page: current } })
}

export const $resumeDetail = (id: string) => {
  return request({ url: `/api/resume/detail/${id}`, method: 'get' })
}

export const $resumeCreate = (data: { userId: string; data: string; img?: string; title?: string }) => {
  return request({ url: '/api/resume/create', method: 'post', data })
}

export const $resumeUpdate = (
  id: string,
  data: Partial<{ userId: string; data: string; img: string; title: string }>
) => {
  return request({ url: `/api/resume/update/${id}`, method: 'put', data })
}

export const $resumeDelete = (id: string) => {
  return request({ url: `/api/resume/delete/${id}`, method: 'delete' })
}