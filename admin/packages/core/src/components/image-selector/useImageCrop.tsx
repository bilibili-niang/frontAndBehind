import Cropper from 'cropperjs'
import { computed, defineComponent, onMounted, reactive, ref, shallowRef, watch, type PropType } from 'vue'
import useModal from '../../hooks/useModal'
import './useImageCrop.scss'
import { Button, Icon, Input, InputNumber, message, Modal, Select, Slider } from '@pkg/ui'
import { SchemaForm, type Schema } from '@pkg/jsf'
import useContextMenu from '../../hooks/useContextMenu'
import BasicAttrs from './basic-attrs'
import { useImagePreview } from '../../../lib'
import { clamp, debounce } from 'lodash'

type ImageCropOptions = {
  type?: string
}

type ImageCropResult = {
  url: string
  type: string
}

/** 处理图片剪裁 */
export const useImageCrop = (src: string, options?: ImageCropOptions) => {
  return new Promise<ImageCropResult>((resolve, reject) => {
    const modal = useModal({
      title: '图片处理',
      content: (
        <CopperView
          src={src}
          options={options}
          onCrop={(res) => {
            modal.destroy()
            resolve(res)
          }}
        />
      ),
      maskClosable: false,
      onCancel: () => {
        reject()
      }
    })
  })
}

const CopperView = defineComponent({
  name: 'ImageCopperView',
  props: {
    src: {
      type: String,
      required: true
    },
    options: {
      type: Object as PropType<ImageCropOptions>
    }
  },
  emits: {
    crop: (res: ImageCropResult) => true
  },
  setup(props, { emit }) {
    const el = ref()
    const imageRef = ref()
    const cropper = shallowRef<Cropper>()
    const initialized = ref(false)

    const state = reactive({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      rotate: 0,
      sizeLock: false,
      flipH: false,
      flipV: false,
      opacity: 1,
      type: props.options?.type ?? 'image/png',
      scale: 100,
      quality: 100
    })

    onMounted(() => {
      imageRef.value.onload = () => {
        cropper.value = new Cropper(imageRef.value, {
          viewMode: 2,
          dragMode: 'move',
          preview: '.image-cropper-view__thumbnail',
          autoCropArea: 1,
          aspectRatio: 0,
          // initialAspectRatio: imageRef.value.width / imageRef.value.height,
          // aspectRatio: imageRef.value.width / imageRef.value.height,
          center: true,
          crop: (e) => {
            Object.assign(state, {
              x: e.detail.x,
              y: e.detail.y,
              height: e.detail.height,
              width: e.detail.width,
              rotate: e.detail.rotate,
              flipH: e.detail.scaleX === -1,
              flipV: e.detail.scaleY === -1
            })

            getSize()
          }
        })

        setTimeout(() => {
          initialized.value = true
        }, 1000)
      }
    })

    const renderState = () => {
      const options = {
        x: state.x,
        y: state.y,
        width: state.width,
        height: state.height,
        rotate: state.rotate,
        scaleX: state.flipH ? -1 : 1,
        scaleY: state.flipV ? -1 : 1
      }
      cropper.value?.setData(options)
    }

    watch(state, renderState)

    watch(
      () => state.sizeLock,
      () => {
        if (sizeLockIgnore) return void 0
        if (state.sizeLock) {
          cropper.value?.setAspectRatio(state.width / state.height)
        } else {
          cropper.value?.setAspectRatio(0)
        }
      }
    )

    let sizeLockIgnore = false
    const setAspectRatio = (ratio: number) => {
      sizeLockIgnore = true
      cropper.value?.setAspectRatio(ratio)
      state.sizeLock = true
      setTimeout(() => {
        sizeLockIgnore = false
      })
    }

    const ratioOptions = ['1:1', '4:3', '3:4', '3:2', '2:3', '7:5', '5:7', '16:9', '9:16', '1.618:1', '1:1.618']

    const customRatioW = ref()
    const customRatioH = ref()

    const onRatioToolClick = (e: MouseEvent) => {
      useContextMenu(e, {
        list: [
          {
            key: 'custom',
            title: '自定义',
            dividerBottom: true,
            handler: () => {
              Modal.confirm({
                title: '自定义剪裁比例',
                maskClosable: true,
                content: () => {
                  return (
                    <div>
                      <div class="image-cropper-view__custom-ratio">
                        <InputNumber
                          prefix="宽"
                          value={customRatioW.value}
                          onChange={(v) => {
                            customRatioW.value = v
                          }}
                        />
                        <strong>&nbsp;:&nbsp;</strong>
                        <InputNumber
                          prefix="高"
                          value={customRatioH.value}
                          onChange={(v) => {
                            customRatioH.value = v
                          }}
                        />
                      </div>
                    </div>
                  )
                },
                onOk: async () => {
                  const r = customRatioW.value / customRatioH.value
                  if (r > 0) {
                    setAspectRatio(r)
                    return Promise.resolve()
                  } else {
                    message.info('无效比例')
                    return Promise.reject()
                  }
                }
              })
            }
          },
          ...ratioOptions.map((item) => {
            const [w, h] = item.split(':') as any
            return {
              key: item,
              title: `${w} : ${h}`,
              handler: () => {
                setAspectRatio(w / h)
              }
            }
          })
        ]
      })
    }
    const RatioTool = () => {
      return (
        <Button onClick={onRatioToolClick}>
          设置比例
          <Icon name="down" />
        </Button>
      )
    }

    const onReset = () => {
      state.quality = 100
      state.scale = 100
      cropper.value?.reset()
    }

    const getImage = () => {
      const canvas: HTMLCanvasElement = cropper.value!.getCroppedCanvas({
        fillColor: state.type === 'image/png' ? undefined : '#fff',
        width: exportWidth.value,
        height: exportHeight.value
      })
      const image = canvas.toDataURL(state.type, state.quality / 100)
      return image
    }

    const onConfirm = () => {
      emit('crop', {
        url: getImage(),
        type: state.type
      })
    }

    const imageSize = ref(0)
    const imageSizeText = computed(() => {
      return imageSize.value < 1024 ? `${imageSize.value} KB` : `${Math.round((imageSize.value / 1024) * 100) / 100} MB`
    })

    const getSize = () => {
      getSizeLoading.value = true
      getSizeHandler()
    }
    const getSizeLoading = ref(false)
    const getSizeHandler = debounce(() => {
      const canvas: HTMLCanvasElement = cropper.value!.getCroppedCanvas({
        width: exportWidth.value,
        height: exportHeight.value
      })
      const imageData = getImage()
      imageSize.value = Math.round(((imageData.length * (3 / 4)) / 1024) * 100) / 100
      getSizeLoading.value = false
    }, 1000)

    const scaleRatio = computed(() => {
      return clamp(state.scale / 100, 0.01, 1)
    })
    const exportWidth = computed(() => Math.ceil(state.width * scaleRatio.value))
    const exportHeight = computed(() => Math.ceil(state.height * scaleRatio.value))

    const imageCompressTypes = ['image/jpeg', 'image/webp']

    const imageTypeOptions = [
      { value: 'image/png', label: 'png' },
      { value: 'image/jpeg', label: 'jpg／jpeg (可压缩)' },
      { value: 'image/webp', label: 'webp (可压缩)' }
    ]

    const exportSchema: Schema = {
      title: '输出',
      type: 'object',
      properties: {
        type: {
          title: '格式',
          type: 'string',
          widget: 'select',
          config: {
            options: imageTypeOptions,
            getPopupContainer: () => el.value
          }
        },
        scale: {
          title: '缩放',
          type: 'number',
          widget: 'slider',
          config: {
            suffix: '%',
            min: 1,
            max: 100
          }
        },
        quality: {
          title: '质量',
          type: 'number',
          widget: 'slider',
          condition: (rootValue) => ['image/jpeg', 'image/webp'].includes(rootValue.type),
          config: {
            suffix: '%',
            min: 1,
            max: 100
          }
        },
        preview: {
          title: '预览',
          type: 'null',
          widget: () => {
            return (
              <div class="image-cropper-view__summary">
                <div style="flex:1">
                  <div>
                    {exportWidth.value} &times; {exportHeight.value}
                  </div>
                  <div>{getSizeLoading.value ? '大小计算中...' : `≈ ${imageSizeText.value}`}</div>
                  <div style="text-align:right;padding-right:8px;white-space:nowrap">
                    <span class="color-disabled">点击预览实际效果</span> 👉🏻&nbsp;
                  </div>
                </div>
                <div
                  class="image-cropper-view__preview"
                  onClick={() => {
                    useImagePreview({
                      url: getImage()
                    })
                  }}
                >
                  <div class={['image-cropper-view__thumbnail clickable', state.type !== 'image/png' && 'fill']}></div>
                </div>
              </div>
            )
          }
        }
      }
    }

    return () => {
      return (
        <div class="image-cropper-view" ref={el}>
          <div class="image-cropper-view__container">
            <div class="image-cropper-view__content">
              <img class="image-cropper-view__image" ref={imageRef} src={props.src} />
            </div>
          </div>
          <div class="image-cropper-view__panel">
            <div class="image-cropper-view__form">
              <div class="image-cropper-view__toolbar">
                <RatioTool />
              </div>
              <BasicAttrs state={state} />
              {/* <SchemaForm theme="compact" schema={schema} value={data} onChange={(e) => {}} /> */}
            </div>
            <div class="image-cropper-view__form">
              <SchemaForm theme="compact" schema={exportSchema} value={state} onChange={(e) => {}} />
            </div>
            <div class="image-cropper-view__header">
              <Button onClick={onReset}>还原</Button>
              <Button type="primary" onClick={onConfirm}>
                完成编辑
              </Button>
            </div>
          </div>
        </div>
      )
    }
  }
})
