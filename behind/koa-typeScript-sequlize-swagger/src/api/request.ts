/* eslint-disable */
import axios, { AxiosError, type AxiosInstance } from 'axios'

declare module 'axios' {
  export interface AxiosRequestConfig {
  }
}
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
// 覆盖 AxiosResponse 默认类型
declare module 'axios' {
  interface AxiosInstance extends Axios {
    // 自定义
    <T = any, R = ResponseData<T>, D = any>(config: AxiosRequestConfig<D>): Promise<R>

    <T = any, R = ResponseData<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>
    defaults: Omit<AxiosDefaults, 'headers'> & {
      headers: HeadersDefaults & {
        [key: string]: AxiosHeaderValue
      }
    }
  }
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
request.interceptors.request.use(async (config: any) => {
  Object.assign(config.headers, getAuthHeaders())
  return config
})
/**
 * @description 响应收到后的拦截器
 * @returns {AxiosResponse} payload
 */
request.interceptors.response.use(async (response: any) => {
  return Promise.resolve(response.data)
}, err)
export {
  request
}
