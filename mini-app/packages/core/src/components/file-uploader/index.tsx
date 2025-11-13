import './styles.scss'
import { Icon, message } from '@anteng/ui'
import { defineComponent, ref, type PropType } from 'vue'
import request, { type ResponseBody } from '../../api/request'
import { CommonWidgetPropsDefine } from '@anteng/jsf'

/**
 * 上传文件类型的映射,这里只做一个展示的文字转换
 */
const fileSpecifyType = {
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
}

export default defineComponent({
  name: 'FileUploader',
  props: {
    // 允许上传的文件类型
    allowedTypes: {
      type: Array,
      default: () => ['xlsx']
    },
    maxSize: {
      type: Number,
      default: 6 * 1024 * 1024 // 6MB in bytes
    },
    uploadUrl: {
      type: String,
      required: true
    },
    // 文件上传的场景值 @anteng/config 中有
    scene: {
      type: String,
      default: ''
    },
    //上传成功之后的提示
    message: {
      type: String,
      default: '文件上传成功'
    },
    // 想要携带的query
    params: {
      type: Object,
      default: () => ({})
    },
    ...CommonWidgetPropsDefine,
    // 需要一同通过 multipart/form-data 传递的额外字段
    formData: {
      type: Object,
      default: () => ({})
    },
    customRequest: {
      type: Function as PropType<(file: File) => ResponseBody<unknown>>
    }
  },
  // 是否传输成功, true || false
  // 你可以在success中监听上传成功后的返回值,其中可能有http url
  emits: ['uploadedFlag', 'success', 'fail'],
  setup(props, { emit }) {
    const loadingInstance = ref(null)
    const fileInputRef = ref(null)
    const uploadSuccess = ref(false)
    const uploadError = ref(false)
    // 允许上传的文件类型
    const allowTypeList = props.allowedTypes.map((item) => fileSpecifyType[item])

    const handleFileChange = (event: any) => {
      const files = event.target.files
      if (files.length === 0) return

      const file = files[0]
      if (!allowTypeList.includes(file.type)) {
        message.error(`请上传${props.allowedTypes}类型的文件`)
        return
      }

      if (file.size > props.maxSize) {
        message.error(`File size exceeds the limit of ${props.maxSize / (1024 * 1024)} MB.`)
        return
      }

      loadingInstance.value = message.loading({
        content: '文件上传中...',
        duration: 0
      })
      uploadFile(file).then(() => {
        // 重置文件输入框
        fileInputRef.value = null
      })
    }

    const uploadFile = async (file: any) => {
      const formData = new FormData()

      formData.append('file', file)
      if (props.scene) {
        formData.append('scene', props.scene)
      }

      // 附加外部传入的表单字段
      Object.entries(props.formData || {}).forEach(([key, value]: any) => {
        // 忽略 undefined/null，其他值转为字符串或保持 Blob/File
        if (value === undefined || value === null) return
        // FormData 会自动处理 Blob/File；其他类型转成字符串
        formData.append(key, value as any)
      })

      if (!props.uploadUrl && !props.customRequest) {
        // 没有 props.uploadUrl 则会走到这里,此时会触发 onChange,此时组件是widget
        props.onChange(file)
        uploadSuccess.value = true
        loadingInstance.value?.()
        return void 0
      }

      try {
        await (
          props.customRequest
            ? props.customRequest(file)
            : request({
                url: props.uploadUrl,
                method: 'POST',
                timeout: 30 * 1000 * 60,
                headers: {
                  'Content-Type': 'multipart/form-data'
                },
                params: props.params,
                data: formData
              })
        )
          .then((res: any) => {
            loadingInstance.value?.()
            emit('success', res)
            emit('uploadedFlag', true)
            message.success(props.message)
            uploadSuccess.value = true
          })
          .finally(() => {
            loadingInstance.value?.()
          })
      } catch (error) {
        console.error('Error uploading file:', error)
        emit('uploadedFlag', false)
        emit('fail', error)
        message.error('文件上传失败')
      }
    }

    const cleanFile = () => {
      loadingInstance.value = null
      fileInputRef.value = null
      uploadSuccess.value = false
      uploadError.value = false
      props.onChange({})
      message.success('文件已清除成功')
    }

    return () => {
      return (
        <div class="FileUploader">
          {uploadSuccess.value && (
            <div
              class="upload-success-delete-file"
              onClick={() => {
                cleanFile()
              }}
            >
              清除文件
              <Icon name="clear-format" />
            </div>
          )}

          {!uploadSuccess.value && !uploadError.value && (
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              class="uploader-input"
              title={'拖拽文件到此处或点击上传,文件大小限制:' + props.maxSize / 1024 / 1024 + 'MB'}
            />
          )}
          {!uploadSuccess.value && !uploadError.value && (
            <div class="tips">{'拖拽文件到此处或点击上传,文件大小限制:' + props.maxSize / 1024 / 1024 + 'MB'}</div>
          )}
          {uploadSuccess.value && <div class="upload-success">上传成功</div>}
        </div>
      )
    }
  }
})
