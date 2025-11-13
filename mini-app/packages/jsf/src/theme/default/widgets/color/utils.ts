import { toUpper } from 'lodash'
export type Rgb = [r: number, g: number, a: number]

import { hex2rgb as hex2Rgb, rgb2hex } from '../../../../components/color'

export const validateHexColor = (hex: string) => /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(hex)
export const validateRgbaColor = (rgba: string) =>
  /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d*(?:\.\d+)?)\)$/.test(rgba)

export const getRGBA = (rgbaStr: string) => {
  const match = rgbaStr.match(/^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d*(?:\.\d+)?)\)$/)
  return match
    ? {
        r: Number(match[1]),
        g: Number(match[2]),
        b: Number(match[3]),
        a: Number(match[4])
      }
    : null
}

export const formatHex = (color: string, defaultColor = '') => {
  const validated = validateHexColor(color)
  const _color = toUpper(color)
  if (validated) {
    if (_color.length === 4) {
      return '#' + _color[1] + _color[1] + _color[2] + _color[2] + _color[3] + _color[3]
    }
    return _color
  } else if (validateRgbaColor(color)) {
    const rgba = getRGBA(color)
    if (rgba) {
      return '#' + rgb2hex([rgba.r, rgba.g, rgba.b])
    }
  }
  return defaultColor
}

export { hex2Rgb }

// export const hex2Rgb = (hex: string): Rgb => {
//   // const color = formatHex(hex)
//   // const rgx = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
//   // const hex = hexValue.replace(rgx, (m, r, g, b) => r + r + g + g + b + b)
//   const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)!
//   const r = parseInt(rgb[1], 16)
//   const g = parseInt(rgb[2], 16)
//   const b = parseInt(rgb[3], 16)
//   return [r, g, b]
// }

export const hex2Rgba = (hex: string, alpha: number) => {
  const validated = validateHexColor(hex)
  if (!validated) {
    return 'rgba(0, 0, 0, 1)'
  }
  return `rgba(${hex2Rgb(hex).join(',')}, ${alpha}%)`
}
