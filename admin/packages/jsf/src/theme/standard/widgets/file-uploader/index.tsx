// 单文件上传
import './style.scss'
import { defineComponent, ref } from 'vue'
import { CommonWidgetPropsDefine } from '../../../../types/widget'
import { Icon, message } from '@pkg/ui'
import request from '../../../../../../core/src/api/request'
import { Spin } from '@pkg/core'
import { cloneDeep } from 'lodash'

export default defineComponent({
  name: 'fileUploader',
  props: {
    ...CommonWidgetPropsDefine,
    message: {
      type: String,
      default: '文件上传成功'
    },
    scene: {
      type: String,
      default: 'demo'
    }
  },
  // emit 目前没用
  emit: ['success', 'fail'],
  setup(props, { emit }) {
    const { maxSize = 6 * 1024 * 1024 } = props.config

    const fileInputRef = ref(null)
    const uploadSuccess = ref(false)
    const uploadError = ref(false)
    // 是否正在上传文件
    const isUploading = ref(false)
    const fileUrl = ref('')

    // 回显
    const init = () => {
      if (props?.value) {
        uploadSuccess.value = true
        fileUrl.value = cloneDeep(props.value)
      }
    }

    init()
    const handleFileChange = (event: any) => {
      if (isUploading.value) {
        return void 0
      }
      const files = event.target.files
      if (files.length === 0) return

      const file = files[0]

      if (file.size > maxSize) {
        message.error(`File size exceeds the limit of ${maxSize / (1024 * 1024)} MB.`)
        return
      }
      uploadFile(file).then(() => {
        // 重置文件输入框
        fileInputRef.value = null
      })
    }

    const uploadFile = async (file: any) => {
      // 开始上传辣
      isUploading.value = true

      const formData = new FormData()
      formData.append('files', file)
      try {
        await request({
          url: '/api/upload/batch',
          method: 'POST',
          timeout: 30 * 1000 * 60,
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          data: formData
        })
          .then((res: any) => {
            emit('success', res)
            message.success(props.message)
            // 提交下文件，使用相对路径同源访问
            props.onChange(res.data[0].uri || res.data[0].url)
            fileUrl.value = res.data[0].uri || res.data[0].url
            uploadSuccess.value = true
          })
          .finally(() => {
            isUploading.value = false
          })
      } catch (error) {
        isUploading.value = false
        console.error('Error uploading file:', error)
        emit('fail', error)
        message.error('文件上传失败')
      }
    }
    return () => {
      return (
        <>
          {props.config?.topSlot && props.config?.topSlot()}
          <div class={['FileUploader', props.config?.topSlot && 'top-slot-take-up-position']}>
            {isUploading.value ? (
              // <div class="tips">{loadingText().text}</div>
              <div class="tips">
                <Spin />
              </div>
            ) : (
              !uploadSuccess.value &&
              !uploadError.value && (
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  class="uploader-input"
                  title={'拖拽单文件到此处或点击上传,文件大小限制:' + maxSize / 1024 / 1024 + 'MB'}
                />
              )
            )}
            {!uploadSuccess.value && !uploadError.value && !isUploading.value && (
              <div class="tips">{'拖拽单文件到此处或点击上传,文件大小限制:' + maxSize / 1024 / 1024 + 'MB'}</div>
            )}

            {uploadSuccess.value && (
              <div
                class="cancel-btn"
                title="重新上传"
                onClick={() => {
                  isUploading.value = false
                  // 清空已上传的
                  fileInputRef.value = null
                  uploadSuccess.value = false
                  uploadError.value = false
                  fileUrl.value = ''
                  props.onChange('')
                }}
              >
                <Icon name="close"></Icon>
              </div>
            )}

            {uploadSuccess.value && (
              <div class="upload-success">
                <div>上传成功</div>
                <a
                  class="task-item__link clickable"
                  title={'当前文件' + fileUrl.value.split('/')[fileUrl.value.split('/').length - 1]}
                  href={fileUrl.value}
                  target="_blank"
                >
                  <Icon name="click"></Icon>点击下载当前文件
                </a>
                {/*<div class="success-file-name" title="点击下载">
                  点击下载当前文件
                  :{fileUrl.value.split('/')[fileUrl.value.split('/').length - 1]}
                </div>*/}
              </div>
            )}
          </div>
        </>
      )
    }
  }
})
