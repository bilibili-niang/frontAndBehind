import { Button, Modal, Spin } from '@anteng/ui'
import { uniq } from 'lodash'
import { computed, defineComponent, onMounted, type PropType, ref, toRaw } from 'vue'
import './style.scss'
import useImageSelector from '../useImageSelector'
import { requestUploadFile } from '../../api/uploadImage'
import usePreviewImage from '../useImagePreview'
import uuid from '../../utils/uuid'

function extractImageLinks(text: string) {
  // 正则表达式匹配 <img src="...">, background="url(...)" 和 background-image: url(...)
  // 使用非捕获组和惰性匹配来去掉单引号或双引号
  const regex = /(?:<img[^>]+src="([^"]+)|background(?:-image)?: url\(([^)]+)\))(?:(?:(?!").)*)/g
  const matches = [...text.matchAll(regex)]

  // 提取所有匹配项中的链接并返回
  return matches.map((match) => {
    if (match[1]) {
      // 如果匹配到的是 <img src="...">
      return match[1].replace(/['"]/g, '') // 去掉单引号或双引号
    } else {
      // 如果匹配到的是 background="url()" 或 background-image: url()
      return match[2].replace(/['"]/g, '') // 注意：这里的索引是2，因为background url被包裹在两个括号里，去掉单引号或双引号
    }
  })
}

/** 检测第三方图片 */
export const useCheckThirdPartyImageFromRichText = (richText: string) => {
  // 提取，去重，过滤
  const images = uniq(extractImageLinks(richText))
  return images.filter((item) => {
    return !item.includes('anteng')
  })
}

const replaceImages = (richText: string, images: DumpImageItem[]) => {
  let text = richText
  images.forEach((item) => {
    if (item.status === 'success' && item.url) {
      while (text.includes(item.originURL)) {
        text = text.replace(item.originURL, item.url)
      }
    }
  })
  return text
}

const useDumpImages = async (richText: string): Promise<string> => {
  const filteredImages = useCheckThirdPartyImageFromRichText(richText)

  if (filteredImages.length === 0) {
    return Promise.resolve(richText)
  }

  const checkList = filteredImages.map((url) => {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.src = url
      image.crossOrigin = 'Anonymous'
      image.onload = () => resolve(url)
      image.onerror = () => reject(url)
      image.onabort = () => reject(url)
    })
  })

  // 能够读取、识别到的图片资源
  const availableList: string[] = filteredImages.slice(0)
  // 读取失败的图片资源，可能需要重新手动上传
  const unavailableList: string[] = []

  // await Promise.allSettled(checkList).then((res) => {
  //   res.forEach((item) => {
  //     if (item.status === 'fulfilled') {
  //       availableList.push(item.value as string)
  //     } else {
  //       unavailableList.push(item.reason as string)
  //     }
  //   })
  // })

  if (availableList.length === 0) {
    return Promise.resolve(richText)
  }

  // 防止调试时热更新重复弹窗
  // ;(window as any).DumpImagesModal?.destroy?.()
  return new Promise((resolve, reject) => {
    const modal = Modal.open({
      title: '第三方图片转存',
      centered: true,
      closable: false,
      maskClosable: false,
      content: (
        <DumpImages
          images={availableList}
          onComplete={(images) => {
            modal.destroy()
            resolve(replaceImages(richText, images))
          }}
        />
      )
    })
    // ;(window as any).DumpImagesModal = modal
  })
}

type DumpImageItem = {
  originURL: string
  url: null | string
  status: 'loading' | 'success' | 'failed' | ''
}
const DumpImages = defineComponent({
  props: {
    images: {
      type: Array as PropType<string[]>,
      default: () => []
    }
  },
  emits: {
    complete: (images: DumpImageItem[]) => true
  },
  setup(props, { emit }) {
    const images = ref<DumpImageItem[]>(
      (Array.isArray(props.images) ? props.images : []).map((url) => {
        return {
          originURL: url,
          url: null,
          status: ''
        }
      })
    )

    const downloadImage = async (url: string) => {
      // 获取 Blob 数据
      const response = await fetch(url)
      const blob = await response.blob()

      // 将 Blob 数据转换为 File 对象
      const file = new File([blob], uuid(), { type: blob.type })

      return file
    }
    const dump = async (item: DumpImageItem) => {
      item.status = 'loading'
      const file = await downloadImage(item.originURL).catch((err) => {
        item.status = 'failed'
      })
      requestUploadFile(file)
        .then((res) => {
          const image = new Image()
          image.src = res.data.url
          image.onload = () => {
            item.status = 'success'
            item.url = res.data.url
          }
          image.onabort = image.onerror = () => {
            item.status = 'failed'
            item.url = null
            throw new Error()
          }
        })
        .catch((err) => {
          item.status = 'failed'
          item.url = null
        })
    }
    const onRetry = (item: DumpImageItem) => {
      item.status = 'loading'
      setTimeout(() => {
        dump(item)
      }, 300)
    }
    const onManualUpload = (item: DumpImageItem) => {
      useImageSelector({
        onSuccess: (image) => {
          ;(item.url = image.url), (item.status = 'success')
        }
      })
    }

    const hasStarted = ref(false)
    const loading = computed(() => {
      return !!images.value.find((item) => item.status === 'loading')
    })
    const successCount = computed(() => {
      return images.value.filter((item) => item.status === 'success').length
    })

    const onConfirm = () => {
      if (images.value.find((item) => item.status === 'failed')) {
        Modal.confirm({
          title: '中止转存',
          content: (
            <span>
              检测到<strong class="color-error">有转存失败的图片</strong>
              ，您确定要中止此流程吗？<small>(已完成转存的图片不受影响)</small>
            </span>
          ),
          okText: '中止并继续',
          onOk: finish
        })
      } else {
        finish()
      }
    }

    const onStart = () => {
      images.value.forEach((item) => {
        if (item.status !== 'success') {
          dump(item)
        }
      })
    }

    onMounted(() => {
      onStart()
    })

    const finish = () => {
      emit('complete', toRaw(images.value))
    }

    return () => {
      return (
        <div class="dump-image-modal">
          <div class="dump-image-modal__action">
            <strong>
              完成进度：{successCount.value}／{images.value.length}
            </strong>
            &emsp;
            <Button type="primary" loading={loading.value} onClick={onConfirm}>
              完成转存
            </Button>
            {/* {hasStarted.value || successCount.value === images.value.length ? (
              <Button type="primary" loading={loading.value} onClick={onConfirm}>
                完成转存
              </Button>
            ) : (
              <Button type="primary" loading={loading.value} onClick={onStart}>
                一键开始转存
              </Button>
            )} */}
          </div>
          <p class="dump-image-modal__header">
            <strong>检测到此篇图文内含有第三方图片素材，点击上方按钮将自动转存</strong>
            <br/>
            <strong>
              注意：如果转存失败，后续可能导致图片无法正常显示，<span class="color-error">期间请勿进行其他操作</span>
            </strong>
          </p>
        <div class="dump-image-modal__list ui-scrollbar">
            {images.value.map((item) => {
              const Status =
                item.status === 'loading' ? (
                  <div class="dump-image-modal__status">
                    <strong>正在转存</strong>
                    <Spin size="small"/>
                  </div>
                ) : item.status === 'success' ? (
                  <div class="dump-image-modal__status">
                    <strong>上传成功</strong>
                    <iconpark-icon class="color-success" name="ok"></iconpark-icon>
                  </div>
                ) : item.status === 'failed' ? (
                  <div class="dump-image-modal__status color-error">
                    <strong>上传失败</strong>
                    <iconpark-icon name="error"></iconpark-icon>
                    <a onClick={() => onRetry(item)}>重试</a>
                    <a onClick={() => onManualUpload(item)}>手动上传</a>
                  </div>
                ) : (
                  <div class="dump-image-modal__status">
                    <strong>等待开始</strong>
                    <iconpark-icon name="time"></iconpark-icon>
                    <a onClick={() => onManualUpload(item)}>手动上传</a>
                  </div>
                )
              return (
                <div class="dump-image-modal__item">
                  <div
                    class="dump-image-modal__item-image"
                    style={{ backgroundImage: `url(${item.url ?? item.originURL})` }}
                  >
                    <div
                      class="dump-image-modal__item-image-preview clickable"
                      onClick={() => {
                        usePreviewImage({ url: item.url ?? item.originURL })
                      }}
                    >
                      <iconpark-icon name="preview-open"></iconpark-icon>
                    </div>
                  </div>
                  <div class="dump-image-modal__item-content">{Status}</div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }
  }
})

export default useDumpImages
