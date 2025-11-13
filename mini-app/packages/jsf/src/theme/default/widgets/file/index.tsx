import { computed, defineComponent, onMounted, type PropType, ref } from 'vue'
import { CommonWidgetPropsDefine } from '../../../../types/widget'
import { clamp } from 'lodash'
import { formatFileSize } from '@anteng/utils'
import { Icon, message } from '@anteng/ui'
import { requestUploadFile, useImagePreview } from '@anteng/core'
import './style.scss'

export interface FileUploaderOptions {
  /** 限制单文件大小（单位MB），默认 10，取值范围 [2, 2048] */
  maxSize?: number
  /** 限制上传数量，默认 10，取值范围 [1, 100] */
  maxCount?: number
}

export const FileUploader = defineComponent({
  props: {
    ...CommonWidgetPropsDefine,
    config: {
      type: Object as PropType<FileUploaderOptions>,
      required: true
    }
  },
  setup(props) {
    const maxCount = computed(() => {
      return clamp(props.config.maxCount || 10, 1, 100)
    })

    const STATUS_NONE = 0
    const STATUS_UPLOADING = 1
    const STATUS_SUCCESS = 2
    const STATUS_ERROR = 3

    const fileList = ref<
      {
        file: File
        status: number
        url: string
      }[]
    >([])

    const handleUpload = () => {
      setTimeout(() => {
        fileList.value.forEach((item, index) => {
          if (list.value[index].sizeOver) {
            // 文件超过大小限制，不上传
            return void 0
          }
          if (item.status === STATUS_NONE) {
            item.status = STATUS_UPLOADING

            requestUploadFile(item.file)
              .then((res) => {
                if (res.data?.url || res.data?.uri) {
                  item.url = res.data.uri || res.data.url
                  item.status = STATUS_SUCCESS
                } else {
                  item.status = STATUS_ERROR
                }
              })
              .catch((err) => {
                item.status = STATUS_ERROR
              })
              .finally(() => {
                triggerChange()
              })

            // setTimeout(() => {
            //   // item.status = Math.random() > 0.5 ? STATUS_ERROR : STATUS_SUCCESS
            //   item.status = STATUS_SUCCESS
            //   triggerChange()
            // }, Math.random() * 3000)
          }
        })
      })
    }

    const triggerChange = () => {
      props.onChange(
        fileList.value
          .filter((item) => item.status === STATUS_SUCCESS)
          .map((item) => {
            return item.url
          })
      )
    }

    const retrieveValue = () => {
      const files = (props.value || [])?.map((url: string) => {
        return (
          fileList.value.find((item) => item.url === url) || {
            file: new File([], url.match(/\/([^/]+\.[^/]+)$/)?.[1] || url),
            status: STATUS_SUCCESS,
            url
          }
        )
      })
      fileList.value = files || []
    }

    onMounted(() => {
      retrieveValue()
    })

    function isImageOrGif(filename: string): boolean {
      // 使用正则表达式匹配图片或GIF文件的扩展名
      const regex = /\.(jpeg|jpg|png|gif)$/i
      return regex.test(filename)
    }

    const list = computed(() => {
      return fileList.value.map((item) => {
        const file = item.file
        const sizeOver = file.size > maxSize.value * 1024 * 1024
        const type = file.type.startsWith('image/') || isImageOrGif(file.name) ? 'image' : 'file'

        return {
          file: file,
          sizeText: file.size > 0 ? formatFileSize(file.size) : '未知文件大小',
          tip: sizeOver ? '文件过大，请删除后重新上传' : '',
          sizeOver,
          uploadStatus: item.status,
          url: item.url,
          type,
          thumbnail:
            type === 'image' ? (
              <div class="thumbnail clickable" style={{ backgroundImage: `url(${item.url})` }}></div>
            ) : (
              <div class="thumbnail">无缩略图</div>
            )
        }
      })
    })
    const onInputClick = (e: MouseEvent) => {
      if (fileList.value.length >= maxCount.value) {
        e.preventDefault()
        message.info(`已经达到最大上传限制 ${maxCount.value} 个`)
      }
    }
    const onInput = (e: Event) => {
      const ipt = e.target as HTMLInputElement
      const files = ipt.files as unknown as File[]
      fileList.value.unshift(
        ...[...files].map((file) => {
          return { file, status: STATUS_NONE, url: URL.createObjectURL(file as any) }
        })
      )
      if (fileList.value.length > maxCount.value) {
        message.info('超出数量限制，部分文件已自动剔除')
      }
      fileList.value = fileList.value.slice(Math.max(0, fileList.value.length - maxCount.value))

      handleUpload()
    }

    const maxSize = computed(() => {
      return clamp(props.config.maxSize || 10, 2, 2048)
    })

    const onThumbnailClick = (item: (typeof list.value)[number]) => {
      if (item.type === 'image') {
        useImagePreview({
          url: item.url
        })
      }
    }

    const onRemove = (index: number) => {
      fileList.value.splice(index, 1)
      triggerChange()
    }

    return () => {
      if (props.schema.type !== 'array') {
        return <div class="color-error">file.schema.type 仅支持 array</div>
      }
      return (
        <div class="w_file-uploader">
          <div class="w_file-uploader__button clickable">
            <Icon name="file-uploader"/>
            <div class="text">点击上传文件</div>
            <div class="count">
              {fileList.value.length}／{maxCount.value}
            </div>
            {/* 最多值 > 1 时可以多选 */}
            <input
              type="file"
              multiple={maxCount.value > 1}
              class="w_file-uploader__input clickable"
              onClick={onInputClick}
              onInput={onInput}
            />
          </div>
          <div class="w_file-uploader__tip">
            最多上传 {maxCount.value} 个文件，单文件大小限制 {maxSize.value} MB，不限类型
          </div>
          <div class="w_file-uploader__list">
            {list.value.map((item, index) => {
              return (
                <div key={item.url} class={['w_file-uploader__item', item.sizeOver && 'invalid']}>
                  <div
                    class="remove clickable"
                    onClick={() => {
                      onRemove(index)
                    }}
                  >
                    <Icon name="close"/>
                  </div>
                  <div class="avatar" onClick={() => onThumbnailClick(item)}>
                    {item.thumbnail}
                  </div>
                  <div class="info">
                    <div class="name">{item.file.name}</div>
                    <div class="size number-font">{item.sizeText}</div>
                    {!item.sizeOver && (
                      <div
                        class={[
                          'progress',
                          item.uploadStatus === STATUS_ERROR
                            ? 'error'
                            : item.uploadStatus === STATUS_SUCCESS
                              ? 'success'
                              : item.uploadStatus === STATUS_UPLOADING
                                ? 'loading'
                                : ''
                        ]}
                      >
                        <div class="bar"></div>
                      </div>
                    )}
                    <div class="tip error">{item.tip}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }
  }
})

export default FileUploader
