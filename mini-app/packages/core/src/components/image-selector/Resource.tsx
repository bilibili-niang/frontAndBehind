import { computed, defineComponent, onMounted, type PropType, reactive, ref, type Ref } from 'vue'
import { Button, Checkbox, ConfigProvider, message } from '@anteng/ui'
import ImageUploader from '../image-uploader'
import './style.scss'
import './style.dark.scss'
import SubPage from './SubPage'

import { PREFIX_CLS } from '@anteng/config'
import test from '../../utils/test'
import ImageProcess from './image-process'
import Network from './Network'

export const icons = [
  'pic', // 图片
  'video-two', // 视频
  'triangle-round-rectangle', // 图标
  'platte', // 颜色
  'effects', // 特效
  'blossom', // 点缀
  'stickers', // 贴图
  'texture', // 纹理
  'world' // 模型
]

const sortOptions = [
  { label: '按名称顺序', value: 'name' },
  { label: '按最新创建时间', value: 'create' },
  { label: '按最后修改时间', value: 'edit' }
]

export type ImageDefine = {
  url: string
  width: number
  height: number
  /** 资源路径（不含协议与域名），用于保存到业务数据 */
  uri?: string
}

export interface ResourceModalCfg {
  onClose?: () => void
  onSuccess?: (image: ImageDefine) => void
  type?: 'image' | 'video' | 'audio'
  /** 多选 */
  multiple?: boolean
  initialCate?: 'upload' | 'network' | 'recent'

  /** 最大宽度像素，必须宽、高同时 > 0 才生效 */
  maxWidth?: number
  /** 最大高度像素，必须宽、高同时 > 0 才生效 */
  maxHeight?: number
  /** 最大体积，默认单位 kb，可指定：kb／mb */
  maxSize?: number | string

  minWidth?: number
  minHeight?: number

  /** 禁止保存到最近上传（本地），默认 false 不禁用 */
  localStorageDisabled?: boolean

  /** 只显示上传功能，隐藏最近上传、网络资源等 */
  uploaderOnly?: boolean
}

const fileTypeMap = [
  { label: '图片', value: 'image' },
  { label: '视频', value: 'video' },
  { label: '音频', value: 'audio' }
]

export default defineComponent({
  name: 'LegoResourceModal',
  props: {
    typeRef: {
      type: Object as PropType<Ref<ResourceModalCfg['type'] | undefined>>
    },
    config: {
      type: Object as PropType<Ref<ResourceModalCfg>>
    },
    initialCate: {
      type: String as PropType<'upload' | 'recent' | 'network' | string>,
      default: 'upload'
    }
  },
  emits: ['close', 'success'],
  setup(props, { expose, emit }) {
    const categories = computed(() => {
      return [
        { key: 'recent', title: '最近上传', icon: 'time' },
        { key: 'network', title: '网络资源', icon: 'planet' },
        { key: 'icon', title: '图标', icon: 'check-one' }
      ]
    })
    const personalCategories = computed(() => [])

    const recentImages = ref<
      {
        url: string
        width: number
        height: number
        name?: string
        alias?: string
      }[]
    >([])
    onMounted(() => {
      try {
        const list = JSON.parse(localStorage.getItem('null-recent-images') || '[]')
        recentImages.value = list as any[]
      } catch (err) {
        recentImages.value = []
      }
    })

    const renderCategories = computed(() =>
      [{ key: 'upload', title: '上传', icon: 'upload-picture' }].concat(
        state.isPersonal ? personalCategories.value : categories.value
      )
    )

    const cachedSubPages: Record<string, any> = {}

    const state = reactive({
      isPersonal: false,
      currentCate: props.initialCate ?? 'upload' // categories.value[0]?.code
    })

    const isLarge = computed(() => {
      return ['network'].includes(state.currentCate)
    })

    const toggleCate = (key: string) => {
      state.currentCate = key
      if (key !== 'upload' && !cachedSubPages[key]) {
        cachedSubPages[key] =
          key === 'network' ? (
            <Network key={key} onSelect={(image) => handleChoose(image)}/>
          ) : (
            <SubPage data={recentImages} key={key} title={key} onSelect={(image) => handleChoose(image)}/>
          )
      }
    }

    toggleCate(props.initialCate)

    // 关闭
    const close = () => {
      emit('close')
    }

    const selectedList = ref<ImageDefine[]>([])

    const handleChoose = (item: ImageDefine) => {
      const index = selectedList.value.indexOf(item)
      if (index !== -1) {
        selectedList.value.splice(index, 1)
      } else {
        selectedList.value.push(item)
      }

      if (props.typeRef?.value) {
        const type = props.typeRef?.value
        if (type === 'video' && !test.video(item.url)) {
          message.error(`当前限制选择类型： 视频`)
          return void 0
        } else if (type === 'audio' && !test.audio(item.url)) {
          message.error(`当前限制选择类型： 音频`)
          return void 0
        } else if (type === 'image' && !test.image(item.url)) {
          message.error(`当前限制选择类型： 图片`)
          return void 0
        }
      }

      // TODO 支持多选
      emit('success', item)
      close()
    }

    const isUpload = computed(() => state.currentCate === 'upload')
    const uploadImage = ref({
      url: '',
      width: 0,
      height: 0
    })

    const onUploadSuccess = (image: ImageDefine) => {
      uploadImage.value = image
      const { url, width, height } = image
      recentImages.value.unshift({
        url,
        width: width || 512,
        height: height || 512,
        name: '',
        alias: '',
        // @ts-ignore
        duration: image.duration
      })

      if (
        !props.config?.value.localStorageDisabled &&
        localStorage.getItem('image-selector-save-as-locale') !== 'false'
      ) {
        // 只允许保存最近 150 个文件链接
        recentImages.value = recentImages.value.slice(0, 150)
        localStorage.setItem('null-recent-images', JSON.stringify(recentImages.value))
      }
    }
    const useUploadURL = () => {
      emit('success', { ...uploadImage.value })
      close()
    }

    const onShow = () => {
      uploadImage.value = {
        url: '',
        width: 0,
        height: 0
      }
    }

    expose({ onShow })

    const onConfirm = (data: ImageDefine | ImageDefine[]) => {
      try {
        ;(Array.isArray(data) ? data : [data]).map(onUploadSuccess)
      } catch (err) {
        err
      }
      emit('success', data)
      close()
    }

    const uploaderOnly = computed(() => {
      return props.config?.value.uploaderOnly ?? false
    })

    return () => {
      return (
        <ConfigProvider prefixCls={PREFIX_CLS}>
          <div
            class={['lego-resource', isLarge.value && 'lego-resource--large', uploaderOnly.value && 'uploader-only']}
          >
            {!uploaderOnly.value && (
              <div class="lego-resource__menu">
                <div class="lego-resource__title">
                  <strong>设计资源</strong>
                </div>
                <div class="lego-resource__category ui-scrollbar">
                  {renderCategories.value.map((category) => {
                    return (
                      <div
                        key={category.key}
                        class={[
                          'lego-resource__category-item clickable',
                          state.currentCate === category.key && '--active'
                        ]}
                        onClick={() => toggleCate(category.key)}
                      >
                        <iconpark-icon class="icon" name={category.icon || 'pic'}/>
                        <span class="ellipsis">{category.title}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            <div class="lego-resource__content jsf-ui">
              <div class="lego-resource__content-header">
                <div class="lego-resource__sub-title">
                  {isUpload.value
                    ? '上传资源'
                    : categories.value.find((item) => item.key === state.currentCate)?.title}
                </div>
              </div>
              <div class="lego-resource-upload" style={state.currentCate !== 'upload' ? 'display:none' : ''}>
                {props.typeRef?.value === 'image' ? (
                  <ImageProcess
                    multiple={props.config?.value.multiple}
                    onConfirm={onConfirm}
                    maxWidth={props.config?.value.maxWidth}
                    maxHeight={props.config?.value.maxHeight}
                    minWidth={props.config?.value.minWidth}
                    minHeight={props.config?.value.minHeight}
                    maxSize={props.config?.value.maxSize}
                    localStorageDisabled={props.config?.value.localStorageDisabled || uploaderOnly.value}
                  />
                ) : (
                  <div class={['lego-resource-upload__input', uploadImage.value.url && '--preview']}>
                    <ImageUploader type={props.typeRef?.value} src={uploadImage.value.url} onChange={onUploadSuccess}/>
                  </div>
                )}

                {props.typeRef?.value !== 'image' && (
                  <div class="lego-resource-upload__actions">
                    <Checkbox checked={true}/>
                    <small style="opacity:0.7;margin-left: 8px;">同时保存到最近上传</small>
                    <Button
                      style="margin-left: auto;"
                      type="primary"
                      disabled={!uploadImage.value.url}
                      onClick={useUploadURL}
                    >
                      确定
                    </Button>
                  </div>
                )}
              </div>
              {Object.keys(cachedSubPages).map((key) => {
                const Page = cachedSubPages[key]
                if (Page.el) {
                  Page.el.style = key !== state.currentCate ? 'display:none' : ''
                }
                return Page
              })}
            </div>
          </div>
        </ConfigProvider>
      )
    }
  }
})
