import { isAllowedImageFormat } from './utils'

export const resize = (image: string, options: ImageProcessResizeOptions) => {
  try {
    if (!isAllowedImageFormat(image)) {
      return image
    }

    if (!image?.match?.(/\.(jpg|jpeg|png)$/i)) return image
    const params = Object.keys(options) as (keyof typeof options)[]
    if (params.length === 0) return image
    return `${image}?x-oss-process=image/resize,${params.map((k) => `${k}_${options[k]}`).join(',')}`
  } catch (err) {
    return image
  }
}

/**
 * 图片缩放，仅支持 JPG、PNG、BMP、GIF、WebP、TIFF 类型
 * @description
 * 1. GIF格式的图片只支持指定宽高缩小，不支持按百分比缩小（按百分比缩小的情况下，动态图会变成静态图）。
 * 2. GIF格式的图片不支持放大。
 * @see {@link https://help.aliyun.com/zh/oss/user-guide/resize-images-4 | 阿里云图片 Resize 文档}
 */
export type ImageProcessResizeOptions = {
  /**
   * 模式
   * lfit：（默认值）：等比缩放，缩放图限制为指定 w 与 h 的矩形内的最大图片。
   * mfit：等比缩放，缩放图为延伸出指定 w 与 h 的矩形框外的最小图片。
   * fill：将原图等比缩放为延伸出指定 w 与 h 的矩形框外的最小图片，然后将超出的部分进行居中裁剪。
   * pad：将原图缩放为指定 w 与 h 的矩形内的最大图片，然后使用指定颜色居中填充空白部分。
   * fixed：固定宽高，强制缩放。
   */
  m?: 'lfit' | 'mfit' | 'fill' | 'pad' | 'fixed'
  /** 宽度 [1,16384] */
  w?: number
  /** 宽度 [1,16384] */
  h?: number
  /** 最长边 [1,16384] */
  l?: number
  /** 最短边 [1,16384] */
  s?: number
  /**
   * 当目标图片分辨率大于原图分辨率时，是否进行缩放。(GIF格式的图片只支持缩小，不支持放大。)
   * 1（默认值）：返回按照原图分辨率转换的图片（可能和原图的体积不一样）。
   * 0：按指定参数进行缩放。
   */
  limit?: 0 | 1
  /**
   * 当缩放模式选择为pad（缩放填充）时，可以设置填充的颜色。
   * RGB颜色值，例如：000000表示黑色，FFFFFF表示白色。
   * 默认值：FFFFFF（白色）
   */
  color?: string

  /** 按百分比缩放, [1, 1000] */
  p?: number
}
