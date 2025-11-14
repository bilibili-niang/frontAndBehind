import Taro from '@tarojs/taro'

export interface IPreviewImagesOptions {
  urls: string[]
  current?: number
}

const usePreviewImages = (options: IPreviewImagesOptions) => {
  const list = Array.isArray(options.urls) ? options.urls : []
  const _options = {
    urls: list,
    current: list[options.current ?? 0] ?? list[0]
  }
  Taro.previewImage(_options)
}

export default usePreviewImages
