import request, { type RequestPagination } from '../request'

export const $resumeList = (params: RequestPagination) => {
  const { size, current } = params as any
  const page = current ?? 1
  const s = size ?? 20
  return request({ url: '/api/resume/list', method: 'get', params: { size: s, page } })
}

export const $resumeDetail = (id: string) => {
  return request({ url: `/api/resume/detail/${id}`, method: 'get' })
}

export const $resumeCreate = (data: { userId: string; data: any; img?: string; title?: string }) => {
  return request({ url: '/api/resume/create', method: 'post', data })
}

export const $resumeUpdate = (id: string, data: Partial<{ userId: string; data: any; img: string; title: string }>) => {
  return request({ url: `/api/resume/update/${id}`, method: 'put', data })
}

export const $resumeDelete = (id: string) => {
  return request({ url: `/api/resume/delete/${id}`, method: 'delete' })
}