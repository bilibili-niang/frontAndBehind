import { computed, ref, watch } from 'vue'
import useModal from '../useModal'
import './slice.scss'
import { Button, Icon, InputNumber, message } from '@pkg/ui'

export const useImageSlice = async (options: { url: string; slices?: any[][]; onSuccess?: (slices) => void }) => {
  const image = new Image()
  image.src = options.url

  // 等待图片加载完成
  await new Promise((resolve, reject) => {
    image.onload = resolve
    image.onerror = reject
  })

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  const x = ref(options.slices?.[0]?.length ?? 1)
  const y = ref(options.slices?.length ?? 1)

  const slices = ref(options.slices || [])

  const isLoading = ref(false)

  const onSlice = () => {
    if (isLoading.value) {
      return void 0
    }

    if (!(x.value * y.value > 1)) {
      message.error('至少需要 2 个切片')
      return void 0
    }

    if (x.value === slices.value?.[0]?.length && y.value === slices.value?.length) {
      message.error('切片网格未发生变化，请重新编辑')
      return void 0
    }

    isLoading.value = true

    let _image = options.url
    if (import.meta.env.DEV) {
      _image = _image.replace('https://dev-cdn.null.cn', '')
    }

    sliceImageIntoGrid(_image, x.value, y.value)
      .then((res) => {
        slices.value = res
      })
      .finally(() => {
        isLoading.value = false
      })
  }

  // let t: NodeJS.Timeout
  // watch(
  //   () => [x.value, y.value],
  //   () => {
  //     clearTimeout(t)
  //     t = setTimeout(() => {
  //       onSlice()
  //     }, 600)
  //   }
  // )

  const onConfirm = () => {
    options.onSuccess?.(slices.value)
    modal.destroy()
  }

  const modal = useModal({
    title: '图层切片',
    centered: true,
    closable: false,
    content: () => {
      let index = 0
      return (
        <div class="image-slice">
          <div class="color-success">
            <div>
              <Icon name="warn-fill" />{' '}
              适用于：因图片尺寸过大导致部分机型显示模糊，为提高用户体验，请尽可能减少切片数量。
            </div>
          </div>
          <div class="image-slice__container">
            <div class="image-slice__image">
              <div class="image-slice__grid">
                {slices.value.map((row, n) => {
                  return (
                    <div class="row">
                      {row.map((col, m) => {
                        !col.isBlank && index++
                        return (
                          <div class={['col', col.isBlank && 'blank']} data-index={col.isBlank ? undefined : index}>
                            {!col.isBlank && (col.url || col.tempPath) && <img src={col.url || col.tempPath} />}
                            {/* {col.file?.size && <span class="size">{formatFileSize(col.file.size)}</span>} */}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
              <img src={options.url} />
            </div>
          </div>
          <div class="image-slice__actions">
            网格：
            <InputNumber
              class="input"
              prefix="横"
              min={1}
              max={10}
              disabled={isLoading.value}
              value={x.value}
              onChange={(v) => (x.value = (v as any) || 1)}
            />
            &nbsp; &times; &nbsp;
            <InputNumber
              class="input"
              prefix="纵"
              min={1}
              max={10}
              disabled={isLoading.value}
              value={y.value}
              onChange={(v) => (y.value = (v as any) || 1)}
            />
            <a onClick={onSlice}>&emsp;生成</a>
            <i class="gap"></i>
            <Button
              onClick={() => {
                modal.destroy()
              }}
            >
              取消
            </Button>
            <Button type="primary" disabled={slices.value.length <= 0} loading={isLoading.value} onClick={onConfirm}>
              {isLoading.value ? '切片中' : slices.value.length <= 0 ? '未生成切片' : '完成切片'}
            </Button>
          </div>
        </div>
      )
    }
  })
}

function formatFileSize(size: number) {
  const unit = ['B', 'KB', 'MB', 'GB', 'TB']
  let index = 0
  while (size >= 1024 && index < unit.length - 1) {
    size /= 1024
    index++
  }
  return (size.toFixed(2) + ' ' + unit[index]).replace(/\s+/g, '')
}

function blobToFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, { type: blob.type })
}

export async function canvasToFile(canvas: HTMLCanvasElement, fileName: string): Promise<File> {
  return new Promise<File>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blobToFile(blob, fileName))
      } else {
        reject(new Error('Canvas is empty or an error occurred.'))
      }
    }, 'image/png')
  })
}

async function sliceImageIntoGrid(
  imagePath: string,
  xSlices: number,
  ySlices: number
): Promise<{ file?: File; tempPath?: string; isBlank: boolean }[][]> {
  function isBlankImageData(imageData: ImageData): boolean {
    const { data } = imageData
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] !== 0) {
        return false
      }
    }
    return true
  }

  const image = new Image()
  image.crossOrigin = 'Anonymous'
  image.src = imagePath

  await new Promise((resolve, reject) => {
    image.onload = resolve
    image.onerror = reject
  })

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Canvas context not available')
  }

  const sliceWidth = image.width / xSlices
  const sliceHeight = image.height / ySlices

  canvas.width = sliceWidth
  canvas.height = sliceHeight

  const grid: { file?: File; tempPath?: string; isBlank: boolean }[][] = []

  for (let y = 0; y < ySlices; y++) {
    const row = []
    for (let x = 0; x < xSlices; x++) {
      ctx.clearRect(0, 0, sliceWidth, sliceHeight)
      ctx.drawImage(image, x * sliceWidth, y * sliceHeight, sliceWidth, sliceHeight, 0, 0, sliceWidth, sliceHeight)

      const imageData = ctx.getImageData(0, 0, sliceWidth, sliceHeight)
      const isBlank = isBlankImageData(imageData)

      const file = await canvasToFile(canvas, `slice_${y}_${x}.png`)

      const tempPath = URL.createObjectURL(file)
      if (isBlank) {
        row.push({ file: undefined, tempPath: undefined, isBlank })
      } else {
        row.push({ file, tempPath, isBlank })
      }
    }
    grid.push(row)
  }

  return grid
}
