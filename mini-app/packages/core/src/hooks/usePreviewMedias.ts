import Taro from '@tarojs/taro'
import usePreviewImages from './usePreviewImages'

export interface IPreviewMediasOptions {
  sources: {
    /** 资源链接 */
    url: string
    /** 类型 */
    type: 'image' | 'video'
    /** 封面 */
    poster: string
  }[]
  /** 当前索引，默认：0 */
  current?: number
  /** 是否显示长按菜单，默认：false */
  showmenu?: boolean
  /** 默认：no-referrer， `origin`: 发送完整的referrer; `no-referrer`: 不发送。格式固定为 `https://servicewechat.com/{appid}/{version}/page-frame.html`，其中 {appid} 为小程序的 appid，{version} 为小程序的版本号，版本号为 0 表示为开发版、体验版以及审核版本，版本号为 devtools 表示为开发者工具，其余为正式版本； */
  referrerPolicy?: string
  success?: (res: any) => void
  fail?: (err: any) => void
  complete?: () => void
}

export const usePreviewMedias = (options: IPreviewMediasOptions) => {
  if (process.env.TARO_ENV === 'h5') {
    usePreviewImages({
      urls: options.sources.map(item => item.poster || item.url),
      current: options.current
    })
  } else {
    Taro.previewMedia(options)
  }
}
