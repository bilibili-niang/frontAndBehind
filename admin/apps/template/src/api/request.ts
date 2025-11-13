/* eslint-disable */
import axios, { AxiosError, type AxiosInstance } from 'axios'
import { openLoginModal, waitForLogin } from '@/composables/authFlow'

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** 不要求登录 */
    ignoreLogin?: boolean
    /** 不携带 JWT Token */
    noToken?: boolean
  }
}

export type RequestPagination<T = {}> = {
  /** 当前页码, 1 开始 */
  current: number
  /** 一页数量 */
  size: number
} & T

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
  return {
    Authorization: localStorage.getItem('Authorization') || 'Basic c3U6c3Vfc2VjcmV0',
    'Blade-Auth': localStorage.getItem('Blade-Auth')
  }
}

// 覆盖 AxiosResponse 默认类型
declare module 'axios' {
  interface AxiosInstance extends Axios {
    // 自定义
    <T = any, R = ResponseData<T>, D = any>(config: AxiosRequestConfig<D>): Promise<R>

    <T = any, R = ResponseData<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>

    // 默认
    // <T = any, R = AxiosResponse<T>, D = any>(config: AxiosRequestConfig<D>): Promise<R>
    // <T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>
    defaults: Omit<AxiosDefaults, 'headers'> & {
      headers: HeadersDefaults & {
        [key: string]: AxiosHeaderValue
      }
    }
  }
}

const request: AxiosInstance = axios.create({
  // 通过 any 规避类型报错，保持 Vite 环境变量读取
  baseURL: (import.meta as any).env?.VITE_APP_BASE_API,
  timeout: 30000, // 请求超时时间
  headers: {
    ...getAuthHeaders()
  }
})

const err = async (error: AxiosError & { config?: any }) => {
  const status = error.response?.status
  const originalConfig = error.config || ({} as any)
  if (status === 401) {
    // 触发全局登录弹窗
    openLoginModal()
    try {
      // 等待登录完成
      await waitForLogin()
      // 避免无限重试，只重试一次
      if (!originalConfig.__retried401) {
        originalConfig.__retried401 = true
        // 重新附加最新头信息
        Object.assign(originalConfig.headers ??= {}, getAuthHeaders())
        return request(originalConfig)
      }
    } catch {}
  }
  return Promise.reject(error)
}

/**
 * @description 请求发起前的拦截器
 * @returns {AxiosRequestConfig} config
 */
request.interceptors.request.use(async (config: any) => {
  Object.assign(config.headers, getAuthHeaders())

  if (!config.noToken) {
    config.headers['Blade-Auth'] = localStorage.getItem('Blade-Auth')
  } else {
    config.headers['Blade-Auth'] = null
    delete config.headers['Blade-Auth']
  }

  return config
})

/**
 * @description 响应收到后的拦截器
 * @returns {AxiosResponse} payload
 */
request.interceptors.response.use(async (response: any) => {
  return Promise.resolve(response.data)
}, err)

export default request
