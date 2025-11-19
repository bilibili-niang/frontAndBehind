/* eslint-disable */
import axios, { AxiosError, type AxiosInstance } from 'axios'
import useLogin from '../hooks/useLogin'
import { router } from '../../lib'

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** 不携带 Blade-Auth Token */
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
  const raw = localStorage.getItem('Blade-Auth') || ''
  const bearer = /^Bearer\s+/i.test(raw) ? raw : raw ? `Bearer ${raw}` : ''
  const pure = raw.replace(/^Bearer\s+/i, '') || ''
  return {
    Authorization: bearer || localStorage.getItem('Authorization') || 'Basic c3U6c3Vfc2VjcmV0',
    'Blade-Auth': pure || null
  }
}

// 覆盖 AxiosResponse 默认类型
declare module 'axios' {
  interface AxiosInstance extends Axios {
    // <T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>
    defaults: Omit<AxiosDefaults, 'headers'> & {
      headers: HeadersDefaults & {
        [key: string]: AxiosHeaderValue
      }
    }

    // 自定义
    <T = any, R = ResponseData<T>, D = any>(config: AxiosRequestConfig<D>): Promise<R>

    // 默认
    // <T = any, R = AxiosResponse<T>, D = any>(config: AxiosRequestConfig<D>): Promise<R>

    <T = any, R = ResponseData<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>
  }
}

const request: AxiosInstance = axios.create({
  // 构建后不再有 devServer 代理，使用环境变量作为基础地址
  baseURL:
    (import.meta as any).env?.VITE_APP_BASE_API ||
    (import.meta as any).env?.VITE_APP_REQUEST_BASE_URL ||
    '',
  timeout: 30000, // 请求超时时间
  headers: {
    ...getAuthHeaders()
  }
})

// // 自定义请求函数
// // @ts-ignore
// const customRequest = async <T extends Promise<any> = ResponseBody<any>>(config: AxiosRequestConfig): T => {
//   try {
//     // 这里的 await request(config) 请确保是你项目中正确的请求函数调用
//     return (await request(config)) as T
//   } catch (error) {
//     // 处理错误
//     throw error
//   }
// }

const err = (error: AxiosError) => {
  if (error.response?.status === 401) {
    // 拦截登录
    useLogin()
    // 回到登录页
    router.replace('/login')
  }
  return Promise.reject(error)
}

/**
 * @description 请求发起前的拦截器
 * @returns {AxiosRequestConfig} config
 */
request.interceptors.request.use(async (config: any) => {
  Object.assign(config.headers ??= {}, getAuthHeaders())
  if (config?.noBladeAuth === true) {
    delete config.headers['Authorization']
  }

  if (config?.noToken === true) {
    delete config.headers['Blade-Auth']
  } else {
    const raw = localStorage.getItem('Blade-Auth') || ''
    const bearer = /^Bearer\s+/i.test(raw) ? raw : raw ? `Bearer ${raw}` : ''
    const pure = raw.replace(/^Bearer\s+/i, '')
    config.headers['Authorization'] = bearer || config.headers['Authorization']
    config.headers['Blade-Auth'] = pure || config.headers['Blade-Auth']
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
