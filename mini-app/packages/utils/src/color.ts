type Color = string // 可以是 '#RRGGBB', '#RGB', 'rgba(r, g, b, a)' 或 'rgb(r, g, b)'

function parseColor(color: Color): [number, number, number, number] {
  color = color === 'transparent' ? 'rgba(255, 255, 255, 0)' : color
  if (color.startsWith('#')) {
    if (color.length === 4) {
      // 处理 #RGB 缩写形式
      const r = parseInt(color[1] + color[1], 16)
      const g = parseInt(color[2] + color[2], 16)
      const b = parseInt(color[3] + color[3], 16)
      return [r, g, b, 1]
    } else if (color.length === 7) {
      // 处理 #RRGGBB 形式
      const r = parseInt(color.slice(1, 3), 16)
      const g = parseInt(color.slice(3, 5), 16)
      const b = parseInt(color.slice(5, 7), 16)
      return [r, g, b, 1]
    } else {
      console.log(new Error('Invalid hex color format'))
      return [255, 255, 255, 1]
    }
  } else if (color.startsWith('rgba')) {
    const parts = color
      .slice(5, -1)
      .split(',')
      .map(part => parseFloat(part.trim()))
    return [parts[0], parts[1], parts[2], parts[3]]
  } else if (color.startsWith('rgb')) {
    const parts = color
      .slice(4, -1)
      .split(',')
      .map(part => parseFloat(part.trim()))
    return [parts[0], parts[1], parts[2], 1]
  } else {
    console.log(new Error('Invalid hex color format'))
    return [255, 255, 255, 1]
  }
}

function colorToString(color: [number, number, number, number]): string {
  const [r, g, b, a] = color
  if (a === 1) {
    return `rgb(${r}, ${g}, ${b})`
  } else {
    return `rgba(${r}, ${g}, ${b}, ${a})`
  }
}

export function calcTransitionColor(color1: Color, color2: Color, tween: number): Color {
  if (color1 === color2) {
    return color1
  }

  const [r1, g1, b1, a1] = parseColor(color1)
  const [r2, g2, b2, a2] = parseColor(color2)

  const r = Math.round(r1 + (r2 - r1) * tween)
  const g = Math.round(g1 + (g2 - g1) * tween)
  const b = Math.round(b1 + (b2 - b1) * tween)
  const a = a1 + (a2 - a1) * tween

  return colorToString([r, g, b, a])
}

/* ---------------------------------- 生成主题色 --------------------------------- */

export function generateColorPalette(primaryColor: string) {
  const hexToRgb = (hex: string): [number, number, number] => {
    const bigint = parseInt(hex.replace('#', ''), 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    return [r, g, b]
  }

  function rgbToHsl(r: number, g: number, b: number) {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h: number,
      s: number,
      l: number = (max + min) / 2

    if (max === min) {
      h = s = 0
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h *= 60
    }
    return [h, s * 100, l * 100]
  }

  function hslToRgb(h: number, s: number, l: number) {
    s /= 100
    l /= 100
    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    const m = l - c / 2
    let r = 0,
      g = 0,
      b = 0

    if (0 <= h && h < 60) {
      r = c
      g = x
      b = 0
    } else if (60 <= h && h < 120) {
      r = x
      g = c
      b = 0
    } else if (120 <= h && h < 180) {
      r = 0
      g = c
      b = x
    } else if (180 <= h && h < 240) {
      r = 0
      g = x
      b = c
    } else if (240 <= h && h < 300) {
      r = x
      g = 0
      b = c
    } else if (300 <= h && h < 360) {
      r = c
      g = 0
      b = x
    }

    r = Math.round((r + m) * 255)
    g = Math.round((g + m) * 255)
    b = Math.round((b + m) * 255)

    return [r, g, b]
  }

  // 使用非线性亮度调整，避免极端白和极端黑
  const shadeFactors = {
    50: 0.95, // 接近白色
    100: 0.85,
    200: 0.75,
    300: 0.65,
    400: 0.55,
    500: 0.5, // 基准色
    600: 0.45,
    700: 0.35,
    800: 0.3,
    900: 0.2, // 接近黑色，但不太黑
    950: 0.15 // 较深色，但不完全黑
  }

  const [r, g, b] = hexToRgb(primaryColor)
  const [h, s, l] = rgbToHsl(r, g, b)

  const shades: Record<string, string> = {}

  for (const [shade, factor] of Object.entries(shadeFactors)) {
    const newL = l + (factor - 0.5) * 100
    const [shadeR, shadeG, shadeB] = hslToRgb(h, s, newL)
    const hex = `#${((1 << 24) + (shadeR << 16) + (shadeG << 8) + shadeB).toString(16).slice(1)}`
    shades[`--anteng-color-primary-${shade}`] = hex
  }

  const rgbString = `${r}, ${g}, ${b}`
  shades['--anteng-color-primary-rgb'] = rgbString
  shades['--anteng-color-primary'] = primaryColor

  return shades
}

// 示例调用
// const primaryColor = '#3b82f6'
// const palette = generateColorPalette(primaryColor)
// console.log(palette)
