import './style.scss'
import { defineComponent, ref, watch } from 'vue'
import { PREFIX_CLS } from '@pkg/config'

export default defineComponent({
  name: `${PREFIX_CLS}-upload-image`,
  props: {
    value: { type: String, default: '' },
    accept: { type: String, default: 'image/*' },
    size: { type: Number, default: 100 },
    disabled: { type: Boolean, default: false },
    onUpload: { type: Function as any, default: undefined }
  },
  emits: ['update:value', 'change'],
  setup(props, { emit }) {
    const fileInput = ref<HTMLInputElement | null>(null)
    const loading = ref(false)
    const previewUrl = ref(props.value || '')

    watch(() => props.value, (v) => previewUrl.value = v || '')

    const selectFile = () => {
      if (props.disabled) return
      fileInput.value?.click()
    }

    const handleFiles = async (file?: File) => {
      if (!file) return
      loading.value = true
      try {
        let url = ''
        if (typeof props.onUpload === 'function') {
          url = await props.onUpload(file)
        } else {
          url = URL.createObjectURL(file)
        }
        previewUrl.value = url
        emit('update:value', url)
        emit('change', { file, url })
      } finally {
        loading.value = false
      }
    }

    const onInputChange = async (e: any) => {
      const file = e?.target?.files?.[0]
      await handleFiles(file)
      e.target.value = ''
    }

    const onDrop = async (e: DragEvent) => {
      e.preventDefault()
      if (props.disabled) return
      const file = e.dataTransfer?.files?.[0]
      await handleFiles(file)
    }
    const onDragOver = (e: DragEvent) => e.preventDefault()

    const clear = () => {
      previewUrl.value = ''
      emit('update:value', '')
    }

    return () => (
      <div class={`${PREFIX_CLS}-upload-image`} style={{ width: `${props.size + 20}px` }}>
        <div class="card" style={{ width: `${props.size}px`, height: `${props.size}px` }} onClick={selectFile} onDrop={onDrop} onDragover={onDragOver}>
          {previewUrl.value 
            ? <img src={previewUrl.value} class="img" />
            : <div class="placeholder"><span>点击或拖拽图片</span></div>}
          {!props.disabled && previewUrl.value && <div class="overlay"><span class="btn" onClick={(e) => { e.stopPropagation(); clear() }}>移除</span></div>}
          {loading.value && <div class="loading">上传中...</div>}
        </div>
        <div class="tips">{previewUrl.value ? '已选择文件' : '未选择文件'}</div>
        <input ref={(el) => (fileInput.value = el)} type="file" accept={props.accept} style={{ display: 'none' }} onChange={onInputChange}/>
      </div>
    )
  }
})

