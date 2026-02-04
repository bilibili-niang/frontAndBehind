import { computed, defineComponent, ref, watch } from 'vue'
import './style.scss'
import { useImageCrop } from '../useImageCrop'
import useImagePreview from '../../../hooks/useImagePreview'
import { Button, Checkbox, Icon, message, Popover } from '@pkg/ui'
import { requestUploadFile } from '../../../api/uploadImage'
import type { ImageDefine } from '../Resource'
import { clamp } from 'lodash'

// 将 Data URL 转换为 Blob
function dataURLToBlob(dataURL: string) {
  const byteString = atob(dataURL.split(',')[1])
  const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0]
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  return new Blob([ab], { type: mimeString })
}

const kb = 1024 // 定义 1KB 为多少字节
const mb = 1024 * 1024 // 定义 1MB 为多少字节

export default defineComponent({
  name: '',
  props: {
    multiple: {
      type: Boolean,
      default: false
    },
    localStorageDisabled: {
      type: Boolean,
      default: false
    },
    maxWidth: Number,
    maxHeight: Number,
    minWidth: Number,
    minHeight: Number,
    maxSize: [Number, String]
  },
  emits: {
    confirm: (data: ImageDefine | ImageDefine[]) => true
  },
  setup(props, { emit }) {
    const el = ref()
    const inputRef = ref()
    const list = ref<File[]>([])

    const maxWidth = computed(() => props.maxWidth ?? 0)
    const maxHeight = computed(() => props.maxHeight ?? 0)
    const minWidth = computed(() => {
      return (props.minWidth! > 0 && props.minHeight! > 0 && props.minWidth! < maxWidth.value ? props.minWidth : 0) ?? 0
    })
    const minHeight = computed(() => {
      return (
        (props.minWidth! > 0 && props.minHeight! > 0 && props.minHeight! < maxHeight.value ? props.minHeight : 0) ?? 0
      )
    })

    /** 最大体积，单位 kb */
    const maxSize = computed(() => {
      if (typeof props.maxSize === 'number') {
        return props.maxSize > 0 ? props.maxSize : -1 // 不限制
      }

      if (typeof props.maxSize === 'string') {
        const v = parseSize(props.maxSize)
        if (v > 0) {
          return v
        }
      }

      return (10 * mb) / kb // 默认限制 10 mb
    })

    const isSizeUnlimited = computed(() => maxSize.value === -1)

    const isWidthOver = (w: number) => {
      if (maxHeight.value > 0 && maxWidth.value > 0) {
        if (minWidth.value > 0 && minHeight.value > 0) {
          return w < minWidth.value || w > maxWidth.value
        }
        return w > maxWidth.value
      }
      return false
    }

    const isHeightOver = (h: number) => {
      if (maxHeight.value > 0 && maxWidth.value > 0) {
        if (minWidth.value > 0 && minHeight.value > 0) {
          return h < minHeight.value || h > maxHeight.value
        }
        return h > maxHeight.value
      }
      return false
    }

    const { range1End, range2End, calculatePercentage, calculateGradientColorBySize } = useSize(maxSize.value)

    /** 保存到本地 */
    const locale = ref(localStorage.getItem('image-selector-save-as-locale') !== 'false')
    const localStorageDisabled = computed(() => props.localStorageDisabled)
    watch(
      () => locale.value,
      () => {
        localStorage.setItem('image-selector-save-as-locale', locale.value.toString())
      }
    )

    const onChange = (e: any) => {
      if ([].slice.call(e.target.files).find((item: File) => !item.type?.startsWith('image'))) {
        message.error('仅限上传图片文件')
        return void 0
      }

      if (props.multiple) {
        list.value.push(...e.target.files)
      } else {
        if (list.value.length > 0) {
          message.info('当前仅限上传 1 张图片，已替换旧图片')
        }
        list.value = [...e.target.files].slice(-1)
      }
    }

    const onCrop = (index: number) => {
      const originFile = list.value[index]
      const src = URL.createObjectURL(originFile)
      useImageCrop(src, { type: originFile.type })
        .then(({ url, type }) => {
          const blob = dataURLToBlob(url)
          const file = new File([blob], 'canvas_image.png', { type })
          list.value.splice(index, 1, file)
        })
        .catch(() => {})
    }

    const onRemove = (index: number) => {
      list.value.splice(index, 1)
    }

    const uploading = ref(false)
    const onConfirm = async () => {
      if (
        list.value.some((item) => {
          const image = imageElementMap.get(item)
          const { naturalHeight, naturalWidth } = image
          return isWidthOver(naturalWidth) || isHeightOver(naturalHeight)
        })
      ) {
        // message.error(`检测到分辨率超过 宽${maxWidth.value} × 高${maxHeight.value} 的图片，请裁剪压缩或重新上传`)

        message.error(
          `检测到分辨率不符合：宽 ${minWidth.value > 0 ? `${minWidth.value} ~ ` : ''}${maxWidth.value} × 高 ${
            minHeight.value > 0 ? `${minHeight.value} ~ ` : ''
          }${maxHeight.value} 以内的图片，请裁剪压缩或重新上传`
        )

        return void 0
      }

      if (list.value.find((item) => item.size > range2End)) {
        message.error(`检测到存在超过 ${formatSize(range2End)} 大小的图片，请裁剪压缩或重新上传`)
        return void 0
      }

      uploading.value = true
      const closeLoading = message.loading('图片上传中，请稍候...', 0)

      Promise.allSettled(
        list.value.map((file) => {
          return requestUploadFile(file)
        })
      )
        .then((res) => {
          const images = res.map((item: any) => {
            return {
              width: 0,
              height: 0,
              url: item.value.data.url
            }
          })

          Promise.allSettled(
            images.map(
              (item) =>
                new Promise((resolve, reject) => {
                  const img = new Image()
                  img.src = item.url
                  img.onload = () => {
                    item.width = img.naturalWidth || img.width
                    item.height = img.naturalHeight || img.height
                    resolve(item)
                  }
                  img.onabort = reject
                  img.onerror = reject
                })
            )
          )
            .then(() => {
              emit('confirm', props.multiple ? images : images[0])
            })
            .finally(() => {
              uploading.value = false
              closeLoading()
            })
        })
        .catch((err) => {
          uploading.value = false
          closeLoading()
        })
    }

    const imageElementMap = new Map()
    const imageSizeMap = ref(new Map())

    const images = computed(() => {
      return list.value.map((item) => {
        const src = URL.createObjectURL(item)
        const size = formatSize(item.size)
        const color = calculateGradientColorBySize(item.size)

        if (!imageElementMap.has(item)) {
          const imageEl = new Image()
          imageEl.src = src

          imageEl.onload = () => {
            const { naturalWidth, naturalHeight } = imageEl
            imageSizeMap.value.set(item, { naturalWidth, naturalHeight })
          }
          imageElementMap.set(item, imageEl)
        }

        const { naturalWidth = null, naturalHeight = null } = imageSizeMap.value.get(item) ?? {}

        return {
          key: item.name,
          src,
          size,
          color,
          progress: calculatePercentage(item.size),
          naturalWidth,
          naturalHeight
        }
      })
    })

    const hoverIndex = ref(-1)
    const activeIndex = ref(-1)

    const onAnchorClick = (index: number) => {
      ;([] as Element[]).slice.call(el.value.querySelectorAll('.image-process__item'))[index].scrollIntoView({
        behavior: 'smooth',
        inline: 'nearest',
        block: 'nearest'
      })
      activeIndex.value = -1
      requestAnimationFrame(() => {
        activeIndex.value = index
      })
    }

    const inputDrag = ref(false)
    const onDragover = () => {
      inputDrag.value = true
    }
    const onDragleave = () => {
      inputDrag.value = false
    }

    const tip = computed(() => {
      const sizeLimit = isSizeUnlimited.value ? '' : `单个大小不超过 ${formatSize(maxSize.value * 1024)}`

      if (maxWidth.value > 0 && maxHeight.value > 0) {
        return `请上传分辨率：宽 ${minWidth.value > 0 ? `${minWidth.value} ~ ` : ''}${maxWidth.value} × 高 ${
          minHeight.value > 0 ? `${minHeight.value} ~ ` : ''
        }${maxHeight.value} 以内的图片${sizeLimit ? '，' : ''}${sizeLimit}`
      }
      return sizeLimit
    })

    return () => {
      const hoverAnchor = images.value[hoverIndex.value]
      return (
        <>
          <div class="image-process" ref={el} onDragover={onDragover} onDragend={onDragleave} onDrop={onDragleave}>
            {tip.value && <div class="image-process__limit-tip">（{tip.value}）</div>}
            <div
              class={[
                'image-process__input',
                list.value.length > 0 && 'input-hidden',
                inputDrag.value && 'input-visible'
              ]}
            >
              <div>拖拽 图片 文件到此处或点击上传</div>
              <div>
                支持对原图进行 裁剪、压缩 操作&nbsp;
                <Popover
                  getPopupContainer={() => el.value.parentNode}
                  title={
                    <div class="image-process__guides">
                      <img
                        style="width:100px;height:100px;float:left;margin-right:10px;"
                        src="https://dev-cdn.null.cn/upload/b72c3893d7c757af8f63620ad9c205e2.png"
                      />
                      <div>
                        <div>选择图片后，点击「编辑」进行操作</div>
                        支持 JPG、PNG、BMP、WebP、TIFF 类型图片，其他类型可能存在不兼容问题，如：
                        <span class="color-error">GIF 图将变成静态图、SVG 图将变成标量图等...</span>
                      </div>
                    </div>
                  }
                >
                  <Icon name="helper-fill" style="transform:scale(1.15)" />
                </Popover>
              </div>
              <div class="image-process__multiple-tip">{props.multiple ? '可上传多张' : '当前限制上传 1 张'}</div>
              <input
                ref={inputRef}
                class="clickable"
                onDragover={(e) => e.preventDefault()}
                type="file"
                multiple={props.multiple}
                accept="image/*"
                title=""
                onChange={onChange}
                value={undefined}
                onDragleave={onDragleave}
              />
            </div>
            {list.value.length > 0 && (
              <div class="image-process__input-tip" style="margin-top:-12px;margin-bottom: 12px;">
                {props.multiple ? '可继续拖拽图片到此处，或者' : '当前仅限上传 1 张图片，'}
                <a
                  onClick={() => {
                    inputRef.value.click()
                  }}
                >
                  {props.multiple ? '点击上传' : '点击替换'}
                </a>
              </div>
            )}
            <div class="image-process__list ui-scrollbar">
              <div class="image-process__list-content">
                {images.value.map((item, index) => {
                  const wClass = isWidthOver(item.naturalWidth) ? 'error' : ''
                  const hClass = isHeightOver(item.naturalHeight) ? 'error' : ''
                  return (
                    <div class={['image-process__item', index === activeIndex.value && 'active']} key={item.key}>
                      <img src={item.src} alt="图片" />
                      <div class="image-process__item-size" style={{ backgroundColor: item.color }}>
                        <div class={['wh', wClass || (hClass && 'error')]}>
                          <span class={['w', wClass]}>{item.naturalWidth}</span>&nbsp;×&nbsp;
                          <span class={['h', hClass]}>{item.naturalHeight}</span>
                        </div>

                        {item.size}
                      </div>
                      <div class="lego-resource__layer">
                        <div
                          class="handler-button clickable"
                          onClick={() => {
                            onCrop(index)
                          }}
                        >
                          <iconpark-icon class="icon" name="tailoring"></iconpark-icon>
                          <span>{'编辑'}</span>
                        </div>
                        <div
                          class="handler-button clickable"
                          onClick={() => {
                            useImagePreview({ url: item.src })
                          }}
                        >
                          <Icon class="icon" name="preview"></Icon>
                          <span>{'预览'}</span>
                        </div>
                        <div class="handler-button clickable" onClick={() => onRemove(index)}>
                          <iconpark-icon class="icon" name="delete-two"></iconpark-icon>
                          <span>删除</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          <div class={['image-process__indicator', isSizeUnlimited.value && 'unlimited']}>
            <div class="point point1"></div>
            {range1End >= 1 * mb && <div class="point point2" data-value={`${formatSize(range1End)}`}></div>}
            <div class="point point3" data-value={`${formatSize(range2End)}`}></div>
            {images.value.map((item, index) => {
              return (
                <div
                  class="anchor"
                  style={{
                    left: `${item.progress}%`,
                    zIndex: Math.round(item.progress)
                  }}
                  onMouseover={(e) => {
                    hoverIndex.value = index
                  }}
                  onMouseleave={(e) => {
                    hoverIndex.value = -1
                  }}
                  onClick={() => {
                    onAnchorClick(index)
                  }}
                >
                  <img src={item.src} alt="" />
                </div>
              )
            })}
            {
              <div
                class="anchor-hover"
                style={{
                  opacity: hoverAnchor ? 1 : 0,
                  left: `${hoverAnchor?.progress}%`
                }}
              >
                {hoverAnchor && <img src={hoverAnchor.src} />}
              </div>
            }
          </div>
          <div class="lego-resource-upload__actions">
            {!localStorageDisabled.value && (
              <>
                <Checkbox
                  checked={locale.value}
                  onClick={(v) => {
                    locale.value = !locale.value
                  }}
                />
                <small
                  style="opacity:0.7;margin-left: 8px;"
                  onClick={(v) => {
                    locale.value = !locale.value
                  }}
                >
                  同时保存到最近上传
                </small>
              </>
            )}
            {/* <Button style="margin-left: auto;" onClick={close}>
                      取消
                    </Button> */}
            <Button
              style="margin-left:auto;"
              type="primary"
              disabled={list.value.length === 0}
              onClick={onConfirm}
              loading={uploading.value}
            >
              {uploading.value ? '上传中...' : '确定上传'}
            </Button>
          </div>
        </>
      )
    }
  }
})

function formatSize(size: number) {
  const kb = 1024
  const mb = kb * 1024

  if (size < kb) {
    return `${size} B`
  } else if (size < mb) {
    return `${Math.round((size / kb) * 100) / 100} KB`
  } else {
    return `${Math.round((size / mb) * 100) / 100} MB`
  }
}

const useSize = (maxSize: number = 10 * 1024) => {
  const _maxSize = maxSize > 0 ? maxSize : 10 * 1024

  const sizeColorMap = ['rgb(39, 174, 96)', 'rgb(241, 196, 15)', 'rgb(235, 47, 6)']
  const rangeStart = 0
  const range2End = _maxSize * 1024 // 10MB 对应的颜色变化范围
  const range1End = clamp(0.6 * range2End, 0, 2 * mb) // 2MB 对应的颜色变化范围

  function calculatePercentage(
    fileSize: number,
    midPointSize: number = range1End,
    midPointPercentage: number = 70
  ): number {
    const maxFileSize = range2End
    const minPercentage = 0
    const maxPercentage = 100

    if (fileSize <= midPointSize) {
      // Linear interpolation from 0 to midPointPercentage
      return (fileSize / midPointSize) * midPointPercentage
    } else if (fileSize > midPointSize && fileSize <= maxFileSize) {
      // Linear interpolation from midPointPercentage to 100%
      const remainingSize = maxFileSize - midPointSize
      const remainingPercentage = maxPercentage - midPointPercentage
      return midPointPercentage + ((fileSize - midPointSize) / remainingSize) * remainingPercentage
    } else {
      // If fileSize is greater than 10MB, return 100%
      return maxPercentage
    }
  }
  function calculateGradientColorBySize(size: number) {
    let progress

    if (size <= range1End) {
      progress = (size - rangeStart) / (range1End - rangeStart) // 计算进度，从 0 到 1
      return interpolateColor(sizeColorMap[0], sizeColorMap[1], progress)
    } else {
      progress = (size - range1End) / (range2End - range1End) // 计算进度，从 0 到 1
      return interpolateColor(sizeColorMap[1], sizeColorMap[2], progress)
    }
  }

  function interpolateColor(color1: string, color2: string, factor: number) {
    const r1 = parseInt(color1.slice(4, -1).split(',')[0])
    const g1 = parseInt(color1.slice(4, -1).split(',')[1])
    const b1 = parseInt(color1.slice(4, -1).split(',')[2])

    const r2 = parseInt(color2.slice(4, -1).split(',')[0])
    const g2 = parseInt(color2.slice(4, -1).split(',')[1])
    const b2 = parseInt(color2.slice(4, -1).split(',')[2])

    const r = Math.round(r1 + factor * (r2 - r1))
    const g = Math.round(g1 + factor * (g2 - g1))
    const b = Math.round(b1 + factor * (b2 - b1))

    return `rgb(${r}, ${g}, ${b})`
  }

  return {
    calculatePercentage,
    calculateGradientColorBySize,
    range1End,
    range2End
  }
}

function parseSize(s: string) {
  // 使用正则表达式匹配数字和单位
  const match = s
    .trim()
    .split(' ')
    .join('')
    .toLowerCase()
    .match(/^(\d+)([kKmM]?b?)$/)

  if (!match) {
    return -1 // 如果不符合格式，返回 -1
  }

  const size = parseInt(match[1], 10) // 提取数字部分
  const unit = match[2].toLowerCase() // 提取单位部分

  // 根据单位转换为字节数
  switch (unit) {
    case 'kb':
    case 'k':
      return size
    case 'mb':
    case 'm':
      return size * 1024
    default:
      return size
  }
}
