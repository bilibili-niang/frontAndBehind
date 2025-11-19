import { computed, defineComponent, ref } from 'vue'
import { CommonSurveyWidgetPropsDefine, defineManifest, RemoveAnswer, useAnswerValue } from '../ types'
import './style.scss'
import { ANSWER_VALUE_FIELD, ERROR_MESSAGE_REQUIRED, WIDGET_INPUT } from '../../../constants'
import { clamp } from 'lodash-es'
import { formatFileSize } from '@anteng/utils'
import { usePreviewImages, useToast, useUploadFile } from '@anteng/core'
import { Icon } from '@anteng/ui'

const STATUS_NONE = 0
const STATUS_UPLOADING = 1
const STATUS_SUCCESS = 2
const STATUS_ERROR = 3

export const FileUploader = defineComponent({
  props: CommonSurveyWidgetPropsDefine,
  setup(props) {
    const minCount = computed(() => {
      return props.item?.config.multiple ? props.item?.config.count?.min ?? 1 : 1
    })

    const maxCount = computed(() => {
      return clamp(props.item?.config.multiple ? props.item?.config.count?.max ?? 10 : 1, minCount.value, 10)
    })

    const fileList = ref<
      {
        file: File
        status: number
        url: string
      }[]
    >(props.item.answer ?? [])

    const handleUpload = () => {
      setTimeout(() => {
        fileList.value.forEach((item, index) => {
          if (list.value[index].sizeOver) {
            // 文件超过大小限制，不上传
            return void 0
          }
          if (item.status === STATUS_NONE) {
            item.status = STATUS_UPLOADING

            useUploadFile({
              url: item.url,
              name: item.file.name,
              onSuccess: url => {
                item.url = url
                item.status = STATUS_SUCCESS
              },
              onFail: () => {
                item.status = STATUS_ERROR
              }
            })

            // setTimeout(() => {
            //   // item.status = Math.random() > 0.5 ? STATUS_ERROR : STATUS_SUCCESS
            //   item.status = STATUS_SUCCESS
            // }, Math.random() * 3000)
          }
        })
      })
    }

    const list = computed(() => {
      return fileList.value.map(item => {
        const file = item.file
        const sizeOver = file.size > maxSize.value * 1024 * 1024
        const type = file.type?.startsWith('image/') ? 'image' : 'file'
        return {
          file: file,
          sizeText: formatFileSize(file.size || 0),
          tip: sizeOver ? `文件超过 ${maxSize.value} MB，请删除后重新上传` : '',
          sizeOver,
          uploadStatus: item.status,
          url: item.url,
          type,
          thumbnail:
            type === 'image' ? (
              <div class="thumbnail clickable" style={{ backgroundImage: `url(${item.url})` }}></div>
            ) : (
              <div class="thumbnail" style={{ backgroundImage: `url(${item.url})` }}>
                无缩略图
              </div>
            )
        }
      })
    })
    const onInputClick = (e: MouseEvent) => {
      if (fileList.value.length >= maxCount.value) {
        e.preventDefault()
        useToast(`已经达到最大上传限制 ${maxCount.value} 个`)
      }
    }

    const answer = useAnswerValue(props.item)

    const onInput = (e: Event) => {
      const ipt = e.target as HTMLInputElement
      const files = ipt.files as unknown as File[]
      fileList.value.unshift(
        ...[...files].map(file => {
          return { file, status: STATUS_NONE, url: URL.createObjectURL(file as any) }
        })
      )
      if (fileList.value.length > maxCount.value) {
        useToast('超出数量限制，部分文件已自动剔除')
      }
      fileList.value = fileList.value.slice(Math.max(0, fileList.value.length - maxCount.value))

      handleUpload()

      answer.value = fileList.value
    }

    const maxSize = computed(() => {
      return clamp(props.item?.config.maxSize, 1, 10)
    })

    const onThumbnailClick = (item: (typeof list.value)[number]) => {
      if (item.type === 'image') {
        usePreviewImages({
          current: 0,
          urls: [item.url]
        })
      }
    }

    const onRemove = (index: number) => {
      fileList.value.splice(index, 1)
    }

    return () => {
      if (process.env.TARO_ENV === 'weapp') {
        return <div class="color-disabled">微信小程序暂不支持上传文件，请跳过此题目。</div>
      }
      return (
        <div class="sw_file-uploader">
          <div class="sw_file-uploader__button clickable">
            <Icon name="file-uploader" />
            <div class="text">点击上传文件</div>
            <div class="count">
              {fileList.value.length}／{maxCount.value}
            </div>
            {/* 最多值 > 1 时可以多选 */}
            <input
              type="file"
              multiple={maxCount.value > 1}
              class="sw_file-uploader__input clickable"
              onClick={onInputClick}
              onInput={onInput}
            />
          </div>
          <div class="sw_file-uploader__tip">
            最多上传 {maxCount.value} 个文件，单文件大小限制 {maxSize.value} MB，不限类型
          </div>
          <div class="sw_file-uploader__list">
            {list.value.map((item, index) => {
              return (
                <div key={item.url} class={['sw_file-uploader__item', item.sizeOver && 'invalid']}>
                  <div
                    class="remove clickable"
                    onClick={() => {
                      onRemove(index)
                    }}
                  >
                    <Icon name="close" />
                  </div>
                  <div class="avatar" onClick={() => onThumbnailClick(item)}>
                    {item.thumbnail}
                  </div>
                  <div class="info">
                    <div class="name">{item.file.name}</div>
                    <div class="size">{item.sizeText}</div>
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

export const manifest = defineManifest({
  key: WIDGET_INPUT,
  render: FileUploader,
  validate: item => {
    if (process.env.TARO_ENV === 'weapp') {
      return true
    }

    if (item.required && !(item.answer?.length > 0)) {
      // 错误1，必填时，未填写
      return { valid: false, message: ERROR_MESSAGE_REQUIRED }
    }

    // 非必填时可以不回答
    if (!item.required && !item.answer) {
      return true
    }

    // 校验文件数量
    if (item.config.multiple) {
      const min = item?.config.multiple ? item?.config.count?.min ?? 1 : 1
      const max = clamp(item?.config.multiple ? item?.config.count?.max ?? 10 : 1, min, 10)

      if (item.answer?.length < min) {
        // 错误2，上传数量少
        return { valid: false, message: `至少上传 ${min} 个文件` }
      }

      if (item.answer?.length > max) {
        // 错误3，上传数量多
        return { valid: false, message: `最多上传 ${max} 个文件` }
      }
    }

    if (
      item.answer.find(item => {
        return item.status !== STATUS_SUCCESS
      })
    ) {
      // 错误4，存在文件的状态非上传成功
      return { valid: false, message: '存在文件未上传成功，请删除或重试' }
    }

    return true
  },
  format: (data: any[]) => {
    return {
      [ANSWER_VALUE_FIELD]: data?.map(item => item.url).join(',') ?? ''
    }
  },
  retrieve: (answer: RemoveAnswer) => {
    if (!answer[ANSWER_VALUE_FIELD]) return []
    return answer[ANSWER_VALUE_FIELD].split(',').map(url => {
      return {
        file: {},
        status: STATUS_SUCCESS,
        url: url
      }
    })
  }
})
