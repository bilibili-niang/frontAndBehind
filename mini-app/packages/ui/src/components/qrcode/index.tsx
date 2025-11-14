import { DefineComponent } from 'vue'

export interface QrCodeProps {
  /**二维码内容*/
  content: string
  /** 二维码尺寸 @default "100%" */
  size?: string | number
  /** 图片链接 */
  logo?: string
  /** 图片尺寸 @default 60 */
  logoSize?: number
  /** 二维码颜色 @default #000 */
  color?: string
  /** 二维码背景颜色 @default #fff */
  backgroundColor?: string
  /** 纠错等级，默认 L */
  correctLevel?: 'L' | 'M' | 'Q' | 'H'
  /**
   * 绘制完成后回调
   * @param {string} url 二维码图片临时地址，微信小程序时为本地地址，RN为base64
   */
  callback?: (url: string) => void
}

let module: any
if (process.env.TARO_ENV === 'h5') {
  module = require('./h5')
} else {
  module = require('./weapp')
}

const QRCode = (module.default ?? module) as DefineComponent<QrCodeProps>

export default QRCode
