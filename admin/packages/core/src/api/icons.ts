import request from './request'

export type ImageItem = {
  url: string
  width: number
  height: number
  name?: string
  alias?: string
  /** 资源路径（不含协议与域名），用于自定义资源域或CDN */
  uri?: string
}

export type SourceTab = {
  title: string
  icon?: string
  cover?: string
  col?: number
  sources: ImageItem[]
}

/** 获取静态图标素材分类列表 */
export const $getIconSourceList = () => {
  return request<SourceTab[]>({
    url: '/api/icons/list',
    method: 'GET'
  })
}