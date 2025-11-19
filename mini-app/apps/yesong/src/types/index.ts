export type ImageDefine = {
  url: string
  width: number
  height: number
}

declare global {
  interface Window {
    [key: string]: any
  }
}

declare const wx: any

/** 微信地址 */
export type WxAddress = {
  provinceName: string | null
  cityName: string | null
  countyName: string | null
  detailInfo: string | null
  userName: string | null
  telNumber: string | null
}
