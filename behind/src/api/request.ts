/* eslint-disable */
import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'

export type ResponseBody<D> = Promise<ResponseData<D>>
export type ResponseData<D> = {
  code: number
  success: boolean
  data: D
  msg: string
}
export type PaginationData<Record> = {
  countId: string
  current: number
  maxLimit: number
  optimizeCountSql: boolean
  orders: string[]
  pages: number
  records: Record[]
  searchCount: boolean
  size: number
  total: number
}
export type ResponsePaginationData<Record> = ResponseBody<PaginationData<Record>>
export const getAuthHeaders = () => {
  return {}
}
const request: AxiosInstance = axios.create({
  baseURL: '',
  timeout: 30000, // 请求超时时间
})
const err = (error: AxiosError) => {
  return Promise.reject(error)
}
/**
 * @description 请求发起前的拦截器
 * @returns {AxiosRequestConfig} config
 */
request.interceptors.request.use(async (config: AxiosRequestConfig) => {
  Object.assign(config.headers || {}, getAuthHeaders())
  return config
})
/**
 * @description 响应收到后的拦截器
 * @returns {AxiosResponse} payload
 */
request.interceptors.response.use(async (response: AxiosResponse) => {
  return Promise.resolve(response.data)
}, err)
export {
  request
}
