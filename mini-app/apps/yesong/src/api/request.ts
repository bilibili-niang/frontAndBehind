import Taro from '@tarojs/taro'
import axios, { AxiosError } from 'axios'
import useMerchantStore from '../stores/merchant'
import { useUserStore } from '@pkg/core'
import useUTMStore from '../stores/utm'
import { storeToRefs } from 'pinia'

export type RequestPagination<T> = {
  /** 当前页码, 1 开始 */
  current: number
  /** 一页数量 */
  size: number
  [key: string]: any
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
    /** query 携带商户id，merchantId={merchantId} */
    withMerchantId?: boolean
    /** query 携带定位坐标，location={longitude},{latitude} */
    withLocation?: boolean
    /** 是否需要携带utm参数 */
    withUtm?: boolean
  }

  // 覆盖 AxiosResponse 默认类型
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
export const REQUEST_DOMAIN = process.env.TARO_APP_REQUEST_BASE_URL


export const getMerchantId = () => {

  return useMerchantStore().merchantId
}

export const getAuthHeaders = () => {
  return {
    'Blade-Auth': Taro.getStorageSync('Blade-Auth'),
    Authorization: 'Basic bTptX3NlY3JldA=='
  }
}

const service = axios.create({
  baseURL: REQUEST_DOMAIN,
  timeout: 30000, // 请求超时时间
  headers: {
    ...getAuthHeaders()
  }
})

const err = (error: AxiosError) => {
  if (error.response?.status === 401 && !error.config?.ignoreLogin) {
    console.error('尚未登录')
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

  if (config.withMerchantId) {
    config.params = config.params ?? {}
    config.params.merchantId = getMerchantId()
    config.data = config.data ?? {}
    config.data.merchantId = getMerchantId()
  }

  if (config.withLocation) {
    config.params = config.params ?? {}
    const location = useUserStore().userLocation
    const { longitude, latitude } = location ?? {}
    if (longitude && latitude) {
      config.params.location = `${longitude},${latitude}`
    }
  }

  const utmStore = useUTMStore()
  const { utmFromCode } = storeToRefs(utmStore)

  /*
  * 处理 utm 参数
  * 前端需要做的只有：
    1、utm_source：默认写入【海报分享】这四个字
    2、utm_campaign：写入用户制作海报时填写的【海报名称】
    你不要把一堆内容放到某个utm 参数里面去，utm 就不是这样用的
  * */
  if (config.withUtm) {
    if (utmFromCode.value) {
      config.params = config.params ?? {}
      config.params.utmCampaign = utmFromCode.value?.utmCampaign
      config.params.utmSource = utmFromCode.value?.utmSource

      config.data.utmCampaign = utmFromCode.value?.utmCampaign
      config.data.utmSource = utmFromCode.value?.utmSource
    }
  }

  return config
})

/**
 * @description 响应收到后的拦截器
 * @returns {AxiosResponse} payload
 */
service.interceptors.response.use(async response => {
  // await sleep(500)
  // TODO 仅开启调试模式下才使用
  if (process.env.NODE_ENV === 'production' && process.env.TARO_ENV !== 'h5') {
    console.log(response)
  }
  return Promise.resolve(response.data)
}, err)

export default service
