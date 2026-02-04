import { message } from '@pkg/ui'
import useModal from '../useModal'
import './slice.scss'

interface Coordinates {
  lat: number
  lng: number
}

interface Size {
  lat: number
  lng: number
}

interface SliceParams {
  sw: Coordinates // Southwest corner
  ne: Coordinates // Northeast corner
  size: Size // Size to determine divisions
}

interface Slice {
  sw: Coordinates
  ne: Coordinates
}

function sliceArea(params: SliceParams): Slice[][] {
  const { sw, ne, size } = params

  // Calculate the difference in latitude and longitude
  const latDiff = ne.lat - sw.lat
  const lngDiff = ne.lng - sw.lng

  // Determine the number of divisions (n, m) with a range between 2 and 6
  let n = Math.ceil(latDiff / size.lat)
  let m = Math.ceil(lngDiff / size.lng)

  // Clamp n and m to be within the range of 2 to 6
  n = Math.max(1, Math.min(6, n))
  m = Math.max(1, Math.min(6, m))

  // Calculate the size of each slice
  const latStep = latDiff / n
  const lngStep = lngDiff / m

  const slices: Slice[][] = []

  for (let i = 0; i < n; i++) {
    const row: Slice[] = []
    for (let j = 0; j < m; j++) {
      const sliceSw: Coordinates = {
        lat: sw.lat + i * latStep,
        lng: sw.lng + j * lngStep
      }
      const sliceNe: Coordinates = {
        lat: sliceSw.lat + latStep,
        lng: sliceSw.lng + lngStep
      }
      row.push({ sw: sliceSw, ne: sliceNe })
    }
    slices.push(row)
  }

  return slices
}

export const useSlice = async (options: {
  /** 图片链接 */ url: string
  /** 图片矩形在地图的左下角坐标（西南） */
  sw: Coordinates
  /** 图片矩形在地图的右上角坐标（东北） */
  ne: Coordinates
  /** 切割的尺寸 */
  size: Size
}) => {
  const slices = sliceArea(options)
  // console.log(slices, options, slices[0][0].sw, slices[slices.length - 1][slices[0].length - 1].ne)

  // 在这里实现对 url 图片进行切割，要求返回 类似 slices数据并添加属性 url（切割后的图片）

  const image = new Image()
  image.src = options.url

  // 等待图片加载完成
  await new Promise((resolve, reject) => {
    image.onload = resolve
    image.onerror = reject
  })

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  const slicePromises = slices.map((row) =>
    Promise.all(
      row.map(async (slice) => {
        // 计算切片在图片上的尺寸和位置
        const latRatio = (slice.ne.lat - slice.sw.lat) / (options.ne.lat - options.sw.lat)
        const lngRatio = (slice.ne.lng - slice.sw.lng) / (options.ne.lng - options.sw.lng)
        const x = ((slice.sw.lng - options.sw.lng) / (options.ne.lng - options.sw.lng)) * image.width
        const y = ((slice.sw.lat - options.sw.lat) / (options.ne.lat - options.sw.lat)) * image.height
        const width = lngRatio * image.width
        const height = latRatio * image.height

        // 设置画布尺寸以匹配切片
        canvas.width = width
        canvas.height = height

        // 在画布上绘制图片切片
        context?.drawImage(image, x, y, width, height, 0, 0, width, height)

        // 检查切片是否为空白
        const imageData = context?.getImageData(0, 0, width, height)
        const isEmpty = imageData ? isBlank(imageData.data) : true

        // 将画布内容转换为数据 URL
        const sliceUrl = canvas.toDataURL()

        return {
          ...slice,
          url: sliceUrl,
          isEmpty
        }
      })
    )
  )

  const imageSlices = await Promise.all(slicePromises)

  console.log(imageSlices)

  if ([].concat(...(imageSlices as any)).length === 1) {
    message.info('当前图片无需切割')
    return void 0
  }

  useModal({
    centered: true,
    content: () => {
      const n = imageSlices.length
      const m = imageSlices[0].length
      const s = `
        max-height: calc(800px / ${n});
        max-width: calc(1000px / ${m});
      `
      let index = 0
      return (
        <div class={['image-layer-slice-preview']}>
          {imageSlices.map((row, n) => {
            return (
              <div class="row">
                {row.map((item, m) => {
                  if (!item.isEmpty) index++
                  return (
                    <div class={['col', item.isEmpty && 'empty']} data-index={index}>
                      <img style={s} src={item.url} />
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )
    }
  })

  return imageSlices
}

// 辅助函数，用于检查像素数据是否为空白
function isBlank(data: Uint8ClampedArray): boolean {
  for (let i = 0; i < data.length; i += 4) {
    // 检查 RGBA 四个通道是否都为 0
    if (data[i] !== 0 || data[i + 1] !== 0 || data[i + 2] !== 0 || data[i + 3] !== 0) {
      return false
    }
  }
  return true
}
