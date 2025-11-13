import { computed, defineComponent, ref, watch, type PropType } from 'vue'
import './style.scss'
import { message } from '@anteng/ui'
import { requestUploadFile } from '../../api/uploadImage'
import type { ImageDefine } from '../image-selector/Resource'
import uuid from '../../utils/uuid'
import { COMMON_STATUS_OPTIONS } from '@anteng/config'

export default defineComponent({
  name: 'LegoImageUploader',
  props: {
    src: {
      type: String
    },
    type: {
      type: String as PropType<'image' | 'video' | 'audio'>
    }
  },
  emits: {
    change: (image: ImageDefine) => true
  },
  setup(props, { emit }) {
    const src = ref(props.src || '')
    const uploading = ref(false)
    const hasError = ref(false)

    watch(
      () => props.src,
      () => {
        src.value = props.src || ''
      }
    )

    const handleUpload = (options: any) => {
      const id = uuid()
      message.loading({
        content: '文件上传中',
        key: id,
        duration: 0
      })
      src.value = URL.createObjectURL(options.file)
      uploading.value = true
      hasError.value = false
      requestUploadFile(options.file)
        .then((res) => {
          uploading.value = false
          src.value = res.data.uri || res.data.url
          // message.success({
          //   content: '图片上传成功',
          //   key: id
          // })
          if (fileType.value === 'image') {
            const image = new Image()
            image.src = src.value
            image.onload = () => {
              message.success({
                content: '图片上传成功',
                key: id
              })
              triggerChange({
                url: src.value,
                width: (image.naturalWidth ?? image.width) || 512,
                height: (image.naturalHeight ?? image.height) || 512
              })
            }
            image.onerror = () => {
              throw new Error()
            }
          } else if (fileType.value === 'video') {
            const video = document.createElement('video')
            video.src = src.value
            video.onloadeddata = () => {
              document.body.removeChild(video)
              message.success({
                content: '视频上传成功',
                key: id
              })
              triggerChange({
                url: src.value,
                width: video.videoWidth,
                height: video.videoHeight
              })
            }
            video.onerror = () => {
              document.body.removeChild(video)
              throw new Error()
            }
            video.width = 0
            video.height = 0
            document.body.appendChild(video)
          } else if (fileType.value === 'audio') {
            const audio = document.createElement('audio')
            audio.src = src.value
            audio.onloadeddata = () => {
              document.body.removeChild(audio)
              message.success({
                content: '音频上传成功',
                key: id
              })
              triggerChange({
                url: src.value,
                width: 100,
                height: 42,
                // @ts-ignore
                duration: audio.duration
              })
            }
            audio.onerror = () => {
              document.body.removeChild(audio)
              throw new Error()
            }
            document.body.appendChild(audio)
          }
        })
        .catch((err) => {
          uploading.value = false
          hasError.value = true
          src.value = ''
          // TODO 上传进度，异常处理
          message.error({
            content: '图片上传失败',
            key: id
          })
        })
    }

    const triggerChange = (image: ImageDefine) => {
      emit('change', image)
    }

    const fileType = ref<'image' | 'video' | 'audio'>('image')

    const fileTypeMap = [
      { label: '图片', value: 'image' },
      { label: '音频', value: 'audio' },
      { label: '视频', value: 'video' }
    ]

    const typeText = computed(() => fileTypeMap.find((item) => item.value === props.type)?.label)

    const handleChange = (e: any) => {
      const file = e.target.files?.[0] as File

      if (file) {
        if (props.type && !file.type.startsWith(`${props.type}/`)) {
          message.error(`当前限制上传类型：${typeText.value}`)
          return void 0
        }
        if (file.type.startsWith('image/')) {
          fileType.value = 'image'
        } else if (file.type.startsWith('video/')) {
          fileType.value = 'video'
        } else if (file.type.startsWith('audio')) {
          fileType.value = 'audio'
        } else {
          message.error(`暂不支持除 图片/视频/音频 外的文件类型：${file.type}`)
          return void 0
        }
        const formData = new FormData()
        formData.append(`file`, file)
        handleUpload({ file })
      }
    }

    return () => {
      return (
        <div class="image-uploader clickable">
          <input
            type="file"
            title="拖拽 图片/视频/音频 文件到此处或点击上传"
            accept={props.type ? `${props.type}/*` : undefined}
            onChange={handleChange}
          />
          <div class="image-uploader__preview">
            {!src.value ? (
              <div class="image-uploader__tip" data-type={props.type}>
                <div>
                  拖拽 <strong>{typeText.value || '图片／视频／音频'}</strong> 文件到此处
                </div>
                <div>或点击上传</div>
              </div>
            ) : fileType.value === 'image' ? (
              <img src={src.value} alt="" />
            ) : (
              <video src={src.value} controls={true} muted playsinline />
            )}
          </div>
        </div>
      )
    }
  }
})
