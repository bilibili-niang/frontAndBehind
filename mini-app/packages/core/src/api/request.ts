import Taro from '@tarojs/taro'
import axios, { AxiosError } from 'axios'
import { useAppStore, useUserStore } from '../stores'

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

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** 不要求登录 */
    ignoreLogin?: boolean
    /** 不携带 JWT Token */
    noToken?: boolean
    /** query 携带商户id */
    withMerchantId?: boolean
    /** query 携带商户scene */
    withScene?: boolean
  }
}

export const REQUEST_DOMAIN =
  process.env.TARO_ENV === 'h5' && process.env.NODE_ENV === 'development' ? '/' : process.env.TARO_APP_REQUEST_BASE_URL

export const getMerchantId = () => {
  const m = useAppStore().merchantId
  if (m) return m
  if (process.env.TARO_ENV === 'h5') {
    return (window as any).location.href.match(/m=(-?)\d+/)?.[0]?.replace('m=', '') || '1714899756496248834'
  }
}

export const getAuthHeaders = () => {
  return {
    'Blade-Auth': Taro.getStorageSync('Blade-Auth')
  }
}

const service = axios.create({
  baseURL: process.env.NODE_ENV === 'development' && process.env.TARO_ENV === 'h5' ? undefined : REQUEST_DOMAIN,
  timeout: 30000, // 请求超时时间
  headers: {
    ...getAuthHeaders()
  }
})

const err = (error: AxiosError) => {
  if (error.response?.status === 401 && !error.config?.ignoreLogin) {
    console.log('%c 尚未登录', 'color:#e74c3c')
  }
  return Promise.reject(error)
}

/**
 * @description 请求发起前的拦截器
 * @returns {AxiosRequestConfig} config
 */
service.interceptors.request.use(async config => {
  if (!config.noToken) {
    config.headers['Blade-Auth'] = Taro.getStorageSync('Blade-Auth')
  } else {
    config.headers['Blade-Auth'] = null
    delete config.headers['Blade-Auth']
  }

  config.params = config.params ?? {}
  config.data = config.data ?? {}

  if (config.withMerchantId) {
    config.params.merchantId = getMerchantId()
    config.data.merchantId = getMerchantId()
  }

  if (config.withScene) {
    config.params.scene = process.env.TARO_APP_SCENE
    config.data.scene = process.env.TARO_APP_SCENE
  }

  if (config.withLocation) {
    config.params = config.params ?? {}
    const location = useUserStore().userLocation
    const { longitude, latitude } = location ?? {}
    if (longitude && latitude) {
      config.params.location = `${longitude},${latitude}`
    }
  }
  if (config?.contentType) {
    config.headers['Content-Type'] = config.contentType
  }
  return config
})

/**
 * @description 响应收到后的拦截器
 * @returns {AxiosResponse} payload
 */
service.interceptors.response.use(async response => {
  // await sleep(500)
  return Promise.resolve(response.data)
}, err)

export default service
