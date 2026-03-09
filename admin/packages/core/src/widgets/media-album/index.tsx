import { CommonWidgetPropsDefine, type ObjectSchema, type Schema } from '@pkg/jsf'
import { computed, defineComponent, ref, watch } from 'vue'
import './style.scss'
import { Icon, Popover } from '@pkg/ui'
import { getWidgetConfig } from '@pkg/jsf/src/utils/widget'
import useVideoPreview from '../../hooks/useVideoPreview'

import { cloneDeep } from 'lodash'
import uuid from '../../utils/uuid'
import useSchemaFormModal from '../../hooks/useSchemaFormModal'
import { useImagePreview, useModal, withImageResize } from '../../../lib'

/** 媒体相册类型：图片 */
export const MEDIA_ALBUM_TYPE_IMAGE = 0
/** 媒体相册类型：视频 */
export const MEDIA_ALBUM_TYPE_VIDEO = 1
/** 媒体相册类型：视频号 */
export const MEDIA_ALBUM_TYPE_WX_CHANNELS = 2
/** 媒体相册类型 */
export const MEDIA_ALBUM_TYPE_OPTIONS = [
  { label: '图片', value: MEDIA_ALBUM_TYPE_IMAGE },
  { label: '视频', value: MEDIA_ALBUM_TYPE_VIDEO },
  { label: '视频号视频', value: MEDIA_ALBUM_TYPE_WX_CHANNELS }
]

/** 媒体相册节点 */
export interface IMediaAlbumItem {
  /** 媒体类型，0 图片、1 视频，2 视频号 */
  type: number
  /** 图片（封面）链接 */
  url: string
  extra?: {
    /** 视频链接 */
    videoUrl?: string
    /** 视频号用户ID */
    wechatVideoAccountId?: string
    /** 视频号视频ID */
    wechatVideoFeedId?: string
  }
}

const isStringArray = (value: any): value is string[] => {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

const convertUrl = (url: string) => {
  return {
    type: MEDIA_ALBUM_TYPE_IMAGE,
    url: url,
    extra: {
      videoUrl: '',
      wechatVideoAccountId: '',
      wechatVideoFeedId: ''
    }
  }
}

const MediaAlbumWidget = defineComponent({
  name: 'w_media-album',
  props: CommonWidgetPropsDefine,
  setup(props) {
    const isMultiple = computed(() => props.schema.type === 'array' || props.config?.multiple)
    // 将 string 转化成媒体相册图片类型
    if (isMultiple.value) {
      if (isStringArray(props.value)) {
        props.onChange(
          props.value.map((item) => {
            return convertUrl(item)
          })
        )
      }
    } else {
      if (typeof props.value === 'string') {
        props.onChange(convertUrl(props.value))
      }
    }

    return () => {
      if (isMultiple.value) {
        const { value, onChange, ...restProps } = props
        const list = Array.isArray(value) ? value : []
        const onItemChange = (index: number, v: any) => {
          // 存在图片可以多选上传情况
          if (Array.isArray(v)) {
            list.splice(index, 1, ...v)
            props.onChange(list)
          } else {
            list[index] = v
            props.onChange(list)
          }
        }
        const onAdd = (v: any) => {
          // 存在图片可以多选上传情况
          if (Array.isArray(v)) {
            list.push(...v)
            props.onChange(list)
          } else {
            list.push(v)
            props.onChange(list)
          }
        }
        const onItemRemove = (index: number) => {
          list.splice(index, 1)
          props.onChange(list)
        }
        return (
          <div class="w_media-album" {...props.config}>
            {list.map((item, index) => {
              return (
                <MediaAlbumItem
                  key={uuid()}
                  {...restProps}
                  value={item}
                  onChange={(v) => onItemChange(index, v)}
                  onRemove={() => onItemRemove(index)}
                />
              )
            })}
            <MediaAlbumItem key={uuid()} {...restProps} value={null} onChange={(v) => onAdd(v)} />
          </div>
        )
      }
      return <MediaAlbumItem {...props.config} {...props} />
    }
  }
})

export default MediaAlbumWidget

export const generateMediaAlbumSchema = (rootValue?: any, typeOptions = MEDIA_ALBUM_TYPE_OPTIONS) => {
  const isImage = rootValue?.type === MEDIA_ALBUM_TYPE_IMAGE
  const schema: ObjectSchema = {
    type: 'object',
    properties: {
      type: {
        title: '媒体类型',
        type: 'number',
        required: true,
        widget: 'radio-button',
        readonly: Array.isArray(rootValue?.url) && rootValue.url.length > 1,
        config: {
          style: 'width:300px',
          options: typeOptions
        }
      },
      _urls: {
        title: '图片',
        type: 'array',
        widget: 'images',
        condition: (rootValue) => rootValue?.type === MEDIA_ALBUM_TYPE_IMAGE,
        required: true,
        config: {
          compact: true,
          ratio: '4:3',
          width: '33%'
        }
      },
      url: {
        title: isImage ? '图片' : '视频封面',
        type: 'string',
        widget: 'image',
        condition: (rootValue) => rootValue?.type !== MEDIA_ALBUM_TYPE_IMAGE,
        required: rootValue?.type === MEDIA_ALBUM_TYPE_WX_CHANNELS,
        config: {
          compact: true,
          ratio: '4:3',
          width: '33%'
        }
      },
      extra: {
        type: 'object',
        properties: {
          videoUrl: {
            title: '视频',
            type: 'string',
            required: true,
            widget: 'video',
            config: {
              compact: true,
              type: 'video',
              ratio: '4:3',
              width: '33%'
            },
            condition: (rootValue) => rootValue.type === MEDIA_ALBUM_TYPE_VIDEO
          },
          wechatVideoAccountId: {
            // @ts-ignore
            title: (
              <Popover
                title={
                  <img
                    style="width:800px;"
                    src="https://dev-cdn.dev-cdn.ice.cn/upload/20240621/2b75b9402de8fdac279495c1302be8ec.jpg"
                    alt=""
                  />
                }
              >
                <div
                  style="text-decoration: underline;text-decoration-style: dashed;text-decoration-color:var(--dev-cdn.ice-color-primary);text-underline-offset: 3px;cursor: help;
            "
                >
                  视频号ID
                </div>
              </Popover>
            ),
            type: 'string',
            required: true,
            config: {
              placeholder: '必填，请输入'
            },
            condition: (rootValue) => rootValue.type === MEDIA_ALBUM_TYPE_WX_CHANNELS
          },
          wechatVideoFeedId: {
            title: 'feedId（视频ID）',
            type: 'string',
            required: true,
            config: {
              placeholder: '必填，请输入'
            },
            condition: (rootValue) => rootValue.type === MEDIA_ALBUM_TYPE_WX_CHANNELS
          }
        }
      }
    }
  }

  return schema
}

export const MediaAlbumItem = defineComponent({
  props: {
    ...CommonWidgetPropsDefine
  },
  emits: {
    change: (item: IMediaAlbumItem) => true,
    remove: () => true
  },
  setup(props, { emit }) {
    const typeOptions = computed(() => {
      if (!props.config?.types) {
        return MEDIA_ALBUM_TYPE_OPTIONS
      }
      return MEDIA_ALBUM_TYPE_OPTIONS.filter((item: any) => {
        return props.config?.types?.includes(item.value)
      })
    })

    const defaultItem = () => ({
      type: typeOptions.value[0].value,
      url: '',
      extra: {
        videoUrl: '',
        wechatVideoAccountId: '',
        wechatVideoFeedId: ''
      }
    })

    const itemRef = ref(props.value || defaultItem())

    // 将单个 url 转化成数组
    itemRef.value._urls = props.value?.url ? [props.value?.url] : []

    watch(
      () => props.value,
      () => {
        itemRef.value = props.value
      }
    )

    const schemaRef = computed(() => {
      const s: Schema = generateMediaAlbumSchema(itemRef.value, typeOptions.value)
      return s
    })

    const handleAddItem = () => {
      useSchemaFormModal({
        title: '编辑',
        schema: schemaRef,
        data: itemRef.value,
        dataReplicated: true,
        onChange(data) {
          itemRef.value = data
        },
        onOk(data) {
          triggerChange()
        }
      })
    }

    const handleChangeItem = () => {
      handleAddItem()
    }

    const triggerChange = () => {
      // 图片类型，且多选图片，拆分成多个
      if (itemRef.value?.type === MEDIA_ALBUM_TYPE_IMAGE && itemRef.value?._urls?.length > 0) {
        const { url, _urls, ...rest } = itemRef.value
        const items = _urls.map((i: string) => {
          return {
            ...cloneDeep(rest),
            url: i
          }
        })
        emit('change', items)
      } else {
        emit('change', itemRef.value)
      }
    }

    const handlePreview = () => {
      if (itemRef.value.type === MEDIA_ALBUM_TYPE_VIDEO) {
        useVideoPreview({ url: itemRef.value.extra?.videoUrl })
        return void 0
      }
      useImagePreview({ url: itemRef.value.url })
    }
    const onClear = () => {
      itemRef.value = defaultItem()
      props.onChange(null)
      emit('remove')
    }

    const uiRatio = getWidgetConfig(props.schema, 'ratio')

    const ratio = computed(() => {
      if (/^[1-9]\d*:[1-9]\d*$/.test(uiRatio)) {
        const w = uiRatio.split(':')[0]
        const h = uiRatio.split(':')[1]
        return w / h
      } else {
        return 4 / 3
      }
    })

    const wrapperStyle = computed(() => {
      return {
        'padding-bottom': `calc(${(1 / ratio.value) * 100}%)`
      }
    })

    return () => {
      const url = itemRef.value.url
      const videoUrl = itemRef.value.extra?.videoUrl
      const typeTag =
        itemRef.value.type === MEDIA_ALBUM_TYPE_VIDEO
          ? '视频'
          : itemRef.value.type === MEDIA_ALBUM_TYPE_WX_CHANNELS
          ? '微信视频号'
          : ''
      return (
        <div class={['w_media-album__item', !url && !videoUrl && '--empty']}>
          {typeTag && <div class="w_media-album__item-tag">{typeTag}</div>}

          {/* <Input prefix="图片" value={imageURL.value} onChange={handleChange} onPressEnter={handleChange} /> */}
          <div class="thumbnail-wrapper" style={wrapperStyle.value}>
            <div class="thumbnail">
              <div class="image-wrapper">
                {url ? (
                  <img class="image-cover" src={url} alt="" />
                ) : itemRef.value.type === MEDIA_ALBUM_TYPE_VIDEO && videoUrl ? (
                  <video class="image-cover" src={videoUrl}></video>
                ) : (
                  <div class="image-placeholder"></div>
                )}
                <div class="image-handler">
                  {url || videoUrl ? (
                    <div class="handler-button clickable" onClick={handleChangeItem}>
                      <Icon name="image-add" />
                      <span>更改</span>
                    </div>
                  ) : (
                    <div class="handler-button clickable" onClick={handleAddItem}>
                      <Icon name="image-add" />
                      <span>添加</span>
                    </div>
                  )}
                  {!props.config?.simple && (
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

export const useTableMediaAlbum = (list: string[] | IMediaAlbumItem[], options?: { ratio: number }) => {
  let cover = list.find((item) => {
    return !!((item as any)?.url || item)
  })
  cover = typeof cover === 'string' ? cover : cover?.url

  const preview = () => {
    useModal({
      title: '预览',
      // @ts-ignore
      content: (
        <div class="w_media-album-render__modal scroller">
          {list
            .map((item) => {
              if (typeof item === 'string') {
                return <img class="w_media-album-render__modal-item image" src={item}></img>
              }
              if (typeof item === 'string' || item.type === MEDIA_ALBUM_TYPE_IMAGE) {
                return <img class="w_media-album-render__modal-item image" src={item?.url ?? item}></img>
              }
              if (item.type === MEDIA_ALBUM_TYPE_VIDEO) {
                return (
                  <video class="w_media-album-render__modal-item video" src={item?.extra?.videoUrl} controls></video>
                )
              }

              if (item.type === MEDIA_ALBUM_TYPE_WX_CHANNELS) {
                return <img class="w_media-album-render__modal-item wx-channels" src={item?.url}></img>
              }

              return null
            })
            .map((item, index) => {
              return (
                <div class="w_media-album-render__modal-item-wrap">
                  <i>{index + 1}</i>
                  {item}
                </div>
              )
            })}
        </div>
      )
    })
  }

  return (
    <div class="w_media-album-render clickable" onClick={preview}>
      <div class="w_media-album-render__cover">
        <i style={{ backgroundImage: `url(${withImageResize(cover!, { w: 200, h: 200 })})` }}></i>
        {list.slice(1, 3).map((item) => {
          return <i></i>
        })}
      </div>
    </div>
  )
}
