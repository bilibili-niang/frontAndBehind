import Taro from '@tarojs/taro'
import { Ref } from 'vue'

const cacheImages = {}

export const drawImage = (options: {
  canvas: Taro.Canvas
  context: Taro.CanvasContext
  src: string
  x: number
  y: number
  width: number
  height: number
  borderRadius?: number
}) => {
  return new Promise((resolve, reject) => {
    const { canvas, context, src, x, y, width, height, borderRadius } = options
    if (process.env.TARO_ENV === 'h5' || process.env.TARO_ENV === 'weapp') {
      const handler = (img: Taro.Image | HTMLImageElement) => {
        const imgHeight = img.height
        const imgWidth = img.width
        // 图片比例
        const imgRatio = imgWidth / imgHeight
        // 剪裁区域比例
        const clipRatio = width / height

        // 图片选区宽高
        let sw = imgWidth,
          sh = imgHeight

        // 图片中心点
        const ox = imgWidth / 2,
          oy = imgHeight / 2
        // 图片比例 > 剪裁比例 = 高度100% + 宽度自适应
        if (imgRatio > clipRatio) {
          sh = imgHeight
          sw = imgHeight * clipRatio
        } else {
          // 宽度100% + 高度自适应
          sw = imgWidth
          sh = imgWidth / clipRatio
        }

        // 图片选区起点
        const sx = ox - sw / 2
        const sy = oy - sh / 2

        drawRoundRect(context, x, y, width, height, borderRadius ?? 0)
        context.save()
        context.clip()
        context.drawImage(img as any, sx, sy, sw, sh, x, y, width, height)
        context.restore()
        resolve(void 0)
      }

      if (cacheImages[src]) {
        handler(cacheImages[src])
      } else {
        // 微信提供了在canvas内创建img标签的方法，使用和H5一致
        const img = process.env.TARO_ENV === 'h5' ? new Image() : canvas?.createImage()
        img.src = src
        ;(img as any).crossOrigin = 'Anonymous'
        img.onload = () => {
          cacheImages[src] = img
          handler(img)
        }
        img.onerror = () => {
          console.log('图片加载失败...')
          reject()
        }
      }
    } else {
      console.error('该平台暂不支持绘制图片，需实现 downloadImage 后绘制')
      reject()
    }
  })
}

export const useDrawImage = (cvsRef: Ref<Taro.Canvas>, ctxRef: Ref<Taro.CanvasContext>) => {
  return (src: string, x: number, y: number, width: number, height: number, borderRadius?: number) => {
    return drawImage({
      canvas: cvsRef.value,
      context: ctxRef.value,
      src,
      x,
      y,
      width,
      height,
      borderRadius
    })
  }
}

const calcLayout = (list: PuzzleItem[]) => {
  const from = [list[0].x, list[0].y]
  const lastOne = list[list.length - 1]
  const to = [lastOne.x + lastOne.w, lastOne.y + lastOne.h]
  return {
    list,
    from,
    to,
    width: to[0] - from[0],
    height: to[1] - from[1]
  }
}

/** 将图片转化成拼图配置数据，最多支持9张 */
export const puzzle = (config: { images: string[]; width: number; gap?: number; dx?: number; dy?: number }) => {
  const images = config.images.slice(0, 9)
  const count = images.length
  if (!(count > 0)) return { list: [] as PuzzleItem[], from: [0, 0], to: [0, 0], width: 0, height: 0 }
  if (count === 1) {
    return splitRows(config, [count])
  }
  if (count === 2) {
    // 2张图片时的竖直排列需要处理下数据
    const res = splitRows(config, [1, 1])
    res.height = (res.height / 2 / 3) * 4
    res.list[0] = {
      h: (res.list[0].h / 3) * 2,
      w: res.list[0].w,
      x: res.list[0].x,
      y: res.list[0].y,
      url: res.list[0].url
    }
    res.list[1] = {
      h: (res.list[1].h / 3) * 2,
      w: res.list[1].w,
      x: res.list[1].x,
      y: res.list[0].h,
      url: res.list[1].url
    }
    // return splitRows(config, [count])
    return res
  } else if (count === 3) {
    // return puzzleThree(config)
    return splitRows(config, [1, 2])
  } else if (count === 4) {
    return splitRows(config, [2, 2])
  } else if (count === 5) {
    return splitRows(config, [2, 3])
  } else if (count === 6) {
    // 2,1,3 可用
    // return splitRows(config, [2, 1, 3])
    const threeLayout = puzzleThree(config)
    return calcLayout([
      ...threeLayout.list,
      ...splitRows(
        { ...config, images: config.images.slice(3), dy: (config.dy ?? 0) + threeLayout.height + (config.gap ?? 0) },
        [3, 3]
      ).list
    ])
  } else if (count === 7) {
    return splitRows(config, [2, 2, 3])
  } else if (count === 8) {
    return splitRows(config, [2, 3, 3])
  } else if (count === 9) {
    return splitRows(config, [3, 3, 3])
  }
}

type PuzzleItem = {
  url: string
  x: number
  y: number
  w: number
  h: number
}

// 单行均分模式
const puzzleEvenly = (config: { images: string[]; width: number; gap?: number; dx?: number; dy?: number }) => {
  const images = config.images.slice(0, 6)
  const count = images.length
  if (!(count > 0)) return { list: [] as PuzzleItem[], from: [0, 0], to: [0, 0], width: 0, height: 0 }
  const { width, gap = 0, dx = 0, dy = 0 } = config
  const size = (width - gap * (count - 1)) / count
  let x = dx
  let y = dy
  const list = images.map((url, index) => {
    return { url, x: x + (size + gap) * index, y, w: size, h: size }
  })
  return calcLayout(list)
}

/** 拆行均分 */
const splitRows = (
  config: { images: string[]; width: number; gap?: number; dx?: number; dy?: number },
  rule?: number[]
) => {
  if (!rule) return puzzleEvenly(config)
  const rows = [] as string[][]
  const images = config.images.slice(0)
  rule.forEach(count => {
    if (images.length === 0) return void 0
    rows.push(images.splice(0, count))
  })
  let y = config.dy ?? 0
  const list = rows
    .map(images => {
      const rowData = puzzleEvenly({ images, width: config.width, gap: config.gap, dx: config.dx, dy: y })
      y = rowData.to![1] + (config.gap ?? 0)
      return rowData
    })
    .reduce((value, item) => {
      value.push(...item.list)
      return value
    }, [] as PuzzleItem[])
  return calcLayout(list)
}

// 左1大，右2小
const puzzleThree = (config: { images: string[]; width: number; gap?: number; dx?: number; dy?: number }) => {
  const { images, width, gap = 0, dx = 0, dy = 0 } = config
  const smallSize = (width - gap * 2) / 3
  const bigSize = smallSize * 2 + gap
  const list = [
    { url: images[0], x: dx, y: dy, w: bigSize, h: bigSize },
    { url: images[1], x: dx + bigSize + gap, y: dy, w: smallSize, h: smallSize },
    { url: images[2], x: dx + bigSize + gap, y: dy + smallSize + gap, w: smallSize, h: smallSize }
  ]

  return calcLayout(list)
}

export function drawRoundRect(
  ctx: Taro.CanvasContext | CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.arcTo(x + width, y, x + width, y + radius, radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius)
  ctx.lineTo(x + radius, y + height)
  ctx.arcTo(x, y + height, x, y + height - radius, radius)
  ctx.lineTo(x, y + radius)
  ctx.arcTo(x, y, x + radius, y, radius)
  ctx.closePath()
}

export function wrapText(
  ctx: Taro.CanvasContext | CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const lines: string[] = []

  if (ctx) {
    const words = text.split('')
    let currentLine = 0
    let remainingChars = maxLines

    while (words.length > 0 && remainingChars > 0) {
      let line = ''
      let newLine = false

      while (words.length > 0) {
        const word = words.shift()

        if (ctx.measureText(line + word).width < maxWidth) {
          line += word
          newLine = false
        } else {
          remainingChars--

          if (remainingChars === 0) {
            line += '...'
            break
          }

          words.unshift(word as any)
          newLine = true
          break
        }
      }

      lines.push(line)
      currentLine++
    }

    if (remainingChars === 0 && words.length > 0) {
      lines[currentLine - 1] = lines[currentLine - 1].slice(0, -3) + '...'
    }
  }

  return lines
}
