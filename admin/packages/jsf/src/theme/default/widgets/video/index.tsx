import { defineComponent, ref, type PropType, computed } from 'vue'
import { Icon } from '@pkg/ui'
import { useImageSelector, type ImageDefine } from '@pkg/core'
import './style.scss'
import { CommonWidgetPropsDefine } from '../../../../types/widget'
import { getWidgetConfig } from '../../../../utils/widget'
import useVideoPreview from '@pkg/core/src/hooks/useVideoPreview'

export const ImageWidget = defineComponent({
  name: 'ImageWidget',
  props: {
    image: {
      type: Object as PropType<ImageDefine>
    },
    ratio: {
      type: Number,
      default: 16 / 9
    },
    simple: {
      type: Boolean,
      default: false
    }
  },
  emits: {
    change: (image: ImageDefine) => true
  },
  setup(props, { emit }) {
    const imageRef = ref(
      props.image || {
        url: '',
        width: 0,
        height: 0
      }
    )

    const handleAddImage = () => {
      useImageSelector({
        type: 'video',
        onSuccess: (image: ImageDefine) => {
          imageRef.value = image
          triggerChange()
        }
      })
    }

    const handleChangeImage = () => {
      handleAddImage()
    }

    const triggerChange = () => {
      emit('change', imageRef.value)
    }

    const handlePreview = () => {
      useVideoPreview({ url: imageRef.value.url })
    }
    const onClear = () => {
      imageRef.value = {
        url: '',
        width: 0,
        height: 0
      }
      triggerChange()
    }

    const wrapperStyle = computed(() => {
      return {
        'padding-bottom': `calc(${(1 / props.ratio) * 100}%)`
      }
    })

    return () => {
      const url = imageRef.value.url
      return (
        <div class={['jsf-widget-image', !url && '--empty']}>
          {/* <Input prefix="图片" value={imageURL.value} onChange={handleChange} onPressEnter={handleChange} /> */}
          <div class="thumbnail-wrapper" style={wrapperStyle.value}>
            <div class="thumbnail">
              <div class="image-wrapper">
                {url ? <video class="image-cover" src={url} /> : <div class="image-placeholder"></div>}
                <div class="image-handler">
                  {url ? (
                    <div class="handler-button clickable" onClick={handleChangeImage}>
                      <Icon name="image-add" />
                      <span>更改</span>
                    </div>
                  ) : (
                    <div class="handler-button clickable" onClick={handleAddImage}>
                      <Icon name="image-add" />
                      <span>添加</span>
                    </div>
                  )}
                  {!props.simple && (
                    <>
                      <div class="handler-button clickable" onClick={handlePreview}>
                        <Icon name="preview" />
                        <span>预览</span>
                      </div>
                      <div class="handler-button clickable" onClick={onClear}>
                        <Icon name="tag-delete" />
                        <span>删除</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
})

export default defineComponent({
  name: 'JSFWidgetImage',
  props: CommonWidgetPropsDefine,
  setup(props) {
    const uiRatio = getWidgetConfig(props.schema, 'ratio')
    const ratio = computed(() => {
      if (/^[1-9]\d*:[1-9]\d*$/.test(uiRatio)) {
        const w = uiRatio.split(':')[0]
        const h = uiRatio.split(':')[1]
        return w / h
      } else {
        return 16 / 9
      }
    })
    const isSample = getWidgetConfig(props.schema, 'simple')
    let width = getWidgetConfig(props.schema, 'width')
    width = typeof width === 'number' ? `${width}px` : width
    const compact = getWidgetConfig(props.schema, 'compact')
    return () => {
      const value = typeof props.value === 'string' ? { url: props.value } : props.value
      return (
        <ImageWidget
          ratio={ratio.value}
          simple={isSample}
          image={value as ImageDefine}
          style={{
            width
          }}
          onChange={(value) => {
            if (compact) {
              props.onChange(value.url)
            } else {
              props.onChange(value)
            }
          }}
        />
      )
    }
  }
})
