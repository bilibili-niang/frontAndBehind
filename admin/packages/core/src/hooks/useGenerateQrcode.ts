import { toCanvas } from 'qrcode'
type QrcodeOptions = {
  text: string
  size?: number
  level?: 'L' | 'M' | 'Q' | 'H'
  margin?: number
  fill?: {
    color: string
    backgroundColor: string
  }
}

const useGenerateQrcode = (options: QrcodeOptions, callback?: (src: string) => void) => {
  if (!options.text) {
    return null
  }

  const { size = 256, margin = 1, level = 'Q' } = options
  const { color = '#000000', backgroundColor = '#ffffff' } = options.fill ?? {}

  const canvas = document.createElement('canvas')

  toCanvas(
    canvas,
    options.text,
    {
      width: size,
      margin: margin ?? 0,
      color: {
        dark: color,
        light: backgroundColor
      },
      errorCorrectionLevel: level
    },
    (error) => {
      const src = canvas.toDataURL('image/png')
      callback?.(src)
    }
  )
}

export default useGenerateQrcode
