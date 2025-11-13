import { computed, defineComponent, type PropType, ref, watch } from 'vue'
import { Icon } from '@anteng/ui'
import { type ImageDefine, useImagePreview, useImageSelector } from '@anteng/core'
import './style.scss'
import { CommonWidgetPropsDefine } from '../../../../types/widget'
import { getWidgetConfig } from '../../../../utils/widget'

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
    },
    multiple: {
      type: Boolean
    },
    placeholder: String,
    /** 最大宽度像素，必须宽、高同时 > 0 才生效 */
    maxWidth: Number,
    /** 最大高度像素，必须宽、高同时 > 0 才生效 */
    maxHeight: Number,

    /** 最小宽度像素，必须宽、高同时 > 0 才生效 */
    minWidth: Number,
    /** 最小高度像素，必须宽、高同时 > 0 才生效 */
    minHeight: Number,

    /** 最大体积，默认单位 kb，可指定：kb／mb */
    maxSize: [Number, String],
    localStorageDisabled: Boolean,
    config: {
      type: Object,
      default: () => ({})
    }
  },
  emits: {
    change: (image: ImageDefine) => true
  },
  setup(props, { emit, attrs }) {
    const imageRef = ref(
      props.image || {
        url: '',
        width: 0,
        height: 0
      }
    )

    watch(
      () => props.image,
      () => {
        imageRef.value = props.image || {
          url: '',
          width: 0,
          height: 0
        }
      }
    )

    const handleAddImage = () => {
      useImageSelector({
        ...attrs,
        ...props.config,
        multiple: props.multiple,
        maxWidth: props.maxWidth,
        maxHeight: props.maxHeight,
        minWidth: props.minWidth,
        minHeight: props.minHeight,
        maxSize: props.maxSize,
        localStorageDisabled: props.localStorageDisabled,
        onSuccess: (image: ImageDefine) => {
          if (props.multiple) {
            emit('change', image)
          } else {
            // 在非紧凑模式下，直接保存完整对象（包含 uri）
            imageRef.value = image
            triggerChange()
          }
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
      useImagePreview({ url: imageRef.value.url })
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
      const url = imageRef.value.url || props.placeholder
      const isPlaceholder = !!(!imageRef.value.url && props.placeholder)
      return (
        <div class={['jsf-widget-image', !url && '--empty']}>
          <div class="thumbnail-wrapper" style={wrapperStyle.value}>
            <div class="thumbnail">
              <div class="image-wrapper">
                {isPlaceholder && <div class="placeholder-tag">默认</div>}
                {url ? (
                  <img class="image-cover" src={url} alt=""/>
                ) : (
                  <div class="image-placeholder" style={{ backgroundImage: `url(${props.placeholder})` }}></div>
                )}
                <div class="image-handler">
                  {url ? (
                    <div class="handler-button clickable" onClick={handleChangeImage}>
                      <Icon name="image-add"/>
                      <span>更改</span>
                    </div>
                  ) : (
                    <div class="handler-button clickable" onClick={handleAddImage}>
                      <Icon name="image-add"/>
                      <span>添加</span>
                    </div>
                  )}
                  {!props.simple && (
                    <div class="handler-button clickable" onClick={handlePreview}>
                      <Icon name="preview"/>
                      <span>预览</span>
                    </div>
                  )}
                  {url && !isPlaceholder && (
                    <div class="handler-button clickable" onClick={onClear}>
                      <Icon name="tag-delete"/>
                      <span>删除</span>
                    </div>
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
    const compact = getWidgetConfig(props.schema, 'compact') ?? props.config?.compact

    return () => {
      const value = typeof props.value === 'string' ? { url: props.value } : props.value
      return (
        <>
          <ImageWidget
            {...props.schema.config}
            ratio={ratio.value}
            simple={isSample}
            image={value as ImageDefine}
            style={{
              width
            }}
            placeholder={props.config?.placeholder}
            onChange={(value) => {
              // 紧凑模式只存字符串：若存在 uri 则优先保存 uri，否则保存 url
              if (compact || typeof props.value === 'string') {
                props.onChange((value as any).uri ?? value.url)
              } else {
                // 非紧凑模式保存完整对象（包含 uri）
                props.onChange(value)
              }
            }}
          />
        </>

      )
    }
  }
})
