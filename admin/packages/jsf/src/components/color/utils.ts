/**
 * @param h - hue 色相
 * @param s - saturation 饱和度
 * @param v - [value | brightness] 明度
 */
export type HSV = [h: number, s: number, v: number]

/**
 * @param r - red 红色通道
 * @param g - green 绿色通道
 * @param b - blue 蓝色通道
 * @param a - alpha 不透明度
 */
export type RGB = [r: number, g: number, b: number]
export type RGBA = [r: number, g: number, b: number, a: number]

/**
 * 色彩模型 HEX 转 RGB
 * @param hex - 16进制颜色支持 3|6 位格式，且可省略 # 号
 * @param defaultRgb - 无法转化时的返回的RGB，默认 [0, 0, 0]
 * @returns RGB
 */
export function hex2rgb(hex: string, defaultRgb: RGB = [0, 0, 0]): RGB {
  const match = hex.toString().match(/[a-f0-9]{6}|[a-f0-9]{3}/i)
  if (!match) {
    return defaultRgb
  }

  let colorString = match[0]

  if (match[0].length === 3) {
    colorString = colorString
      .split('')
      .map((char) => {
        return char + char
      })
      .join('')
  }

  const integer = parseInt(colorString, 16)
  const r = (integer >> 16) & 0xff
  const g = (integer >> 8) & 0xff
  const b = integer & 0xff

  return [r, g, b]
}

/**
 * 色彩模型 RGB 转 HEX
 * @param rgb - RGB
 * @param withHash - 是否添加 # 号
 * @returns HEX
 */
export function rgb2hex(rgb: RGB, withHash = false) {
  const integer = ((Math.round(rgb[0]) & 0xff) << 16) + ((Math.round(rgb[1]) & 0xff) << 8) + (Math.round(rgb[2]) & 0xff)

  const string = integer.toString(16).toUpperCase()
  return (withHash ? '#' : '') + '000000'.substring(string.length) + string
}

/**
 * HSV 色彩模型 转 RGB
 * @param hsv 颜色
 * @param hsv[0] - hue 色相
 * @param hsv[1] - saturation 饱和度
 * @param hsv[2] - [value | brightness] 明度
 * @description 转化存在精度问题，参考 \<PhotoShop> 的规则对小数位进行四舍五入
 * @returns
 */
export function hsv2rgb(hsv: HSV): RGB {
  const h = hsv[0] / 60
  const s = hsv[1] / 100
  let v = hsv[2] / 100
  const hi = Math.floor(h) % 6

  const f = h - Math.floor(h)
  const p = 255 * v * (1 - s)
  const q = 255 * v * (1 - s * f)
  const t = 255 * v * (1 - s * (1 - f))
  v *= 255

  let rgb = [0, 0, 0]
  switch (hi) {
    case 0:
      rgb = [v, t, p]
      break
    case 1:
      rgb = [q, v, p]
      break
    case 2:
      rgb = [p, v, t]
      break
    case 3:
      rgb = [p, q, v]
      break
    case 4:
      rgb = [t, p, v]
      break
    case 5:
      rgb = [v, p, q]
  }
  return rgb.map((i) => Math.round(i)) as RGB
}

/**
 * RGB 色彩模型 转 HSV
 * @param rgb 颜色
 * @param rgb[0] - red 红色通道
 * @param rgb[1] - green 绿色通道
 * @param rgb[2] - blue 蓝色通道
 * @description 转化存在精度问题，参考 \<PhotoShop> 的规则对小数位进行四舍五入
 * @returns
 */
export function rgb2hsv(rgb: RGB): HSV {
  let rdif
  let gdif
  let bdif
  let h = 0
  let s

  const r = rgb[0] / 255
  const g = rgb[1] / 255
  const b = rgb[2] / 255
  const v = Math.max(r, g, b)
  const diff = v - Math.min(r, g, b)
  const diffc = function (c: number) {
    return (v - c) / 6 / diff + 1 / 2
  }

  if (diff === 0) {
    h = 0
    s = 0
  } else {
    s = diff / v
    rdif = diffc(r)
    gdif = diffc(g)
    bdif = diffc(b)

    if (r === v) {
      h = bdif - gdif
    } else if (g === v) {
      h = 1 / 3 + rdif - bdif
    } else if (b === v) {
      h = 2 / 3 + gdif - rdif
    }

    if (h < 0) {
      h += 1
    } else if (h > 1) {
      h -= 1
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)]
}
