import Taro from '@tarojs/taro'
import { computed, defineComponent, PropType, ref, watch } from 'vue'
import './style.scss'
import { Icon } from '@pkg/ui'
import { REQUEST_DOMAIN, getAuthHeaders } from '../../api/request'
import { Image } from '@tarojs/components'
import { uuid } from '@pkg/utils'
import Spin from '../spin'
import { usePreviewImages } from '../../hooks'

export default defineComponent({
  name: 'ImageUploader',
  props: {
    rowCount: {
      type: Number,
      default: () => 3
    },
    maxCount: {
      type: Number,
      default: () => 3
    },
    images: {
      type: Array as PropType<string[]>
    },
    align: {
      type: String as PropType<'left' | 'right'>,
      default: 'left'
    }
  },
  emits: {
    change: (list: string[]) => true
  },
  setup(props, { emit, expose }) {
    const initialList = computed(
      () =>
        props.images?.map(item => {
          return {
            id: uuid(),
            url: item,
            filePath: '',
            fileName: '',
            status: 'success'
          }
        }) || []
    )

    watch(
      () => initialList.value,
      () => {
        if (list.value.length === 0) {
          list.value = [...initialList.value]
        }
      }
    )

    const list = ref(initialList.value || [])

    const triggerChange = () => {
      emit(
        'change',
        list.value.filter(item => item.status === 'success').map(item => item.url)
      )
    }

    /**
     * 选择上传的图片
     */
    const chooseImage = () => {
      Taro.chooseImage({
        count: Number(props.maxCount) - list.value.length, //上传图片的数量，默认是9
        sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 相册或者相机
        success: res => {
          const restCount = Number(props.maxCount) - list.value.length
          list.value.push(
            ...res.tempFiles.slice(0, restCount).map(item => {
              return {
                id: uuid(),
                url: '',
                filePath: item.path,
                fileName: item.originalFileObj?.name!,
                status: 'pending'
              }
            })
          )
          handleUpload()
        },
        fail: err => {
          console.log(err)
        }
      })
    }

    const clear = () => {
      list.value.splice(0)
    }

    expose({ chooseImage, clear })

    const uploadUrl = `${REQUEST_DOMAIN ?? ''}/null-cornerstone-system/upload/image`

    const handleUpload = () => {
      list.value
        .filter(item => item.status === 'pending')
        .forEach(item => {
          item.status = 'loading'
          const filePath = item.filePath
          // const uploadTask =
          Taro.uploadFile({
            url: uploadUrl,
            filePath: filePath,
            fileName: item.fileName,
            // fileType: 'image',
            header: {
              ...getAuthHeaders()
            },
            name: 'file',
            success: (res: any) => {
              if (typeof res.data == 'string') {
                item.url = JSON.parse(res.data).data?.url
              } else {
                item.url = res.data.data.url
              }
              item.status = 'success'
            },
            fail: err => {
              console.log(err)
              item.status = 'error'
            },
            complete: () => {
              triggerChange()
            }
          })

          // uploadTask.onProgressUpdate(progress => {
          //   console.log(progress)
          // })
        })
    }
    const handleRemove = (index: number) => {
      list.value.splice(index, 1)
      triggerChange()
    }

    return () => {
      return (
        <div class={['n-image-uploader', `align-${props.align}`]}>
          {list.value.map((item, index) => {
            return (
              <div
                key={item.id}
                class="image-item"
                style={{
                  marginRight: (index + 1) % props.rowCount === 0 ? 0 : '4%',
                  width: `calc((100% - 4% * ${props.rowCount - 1}) / ${props.rowCount})`,
                  paddingBottom: `calc((100% - 4% * ${props.rowCount - 1}) / ${props.rowCount})`
                }}
                onClick={() => {
                  usePreviewImages({
                    urls: list.value.map(() => item.url || item.filePath),
                    current: index
                  })
                }}
              >
                <Image class="image" src={item.url || item.filePath} mode="aspectFill"></Image>
                {item.status === 'loading' && (
                  <div class="uploading">
                    <Spin />
                  </div>
                )}
                {item.status === 'error' && <div class="uploading">上传失败</div>}
                {item.status !== 'loading' && (
                  <div
                    class="remove-btn"
                    onClick={() => {
                      handleRemove(index)
                    }}
                  ></div>
                )}
              </div>
            )
          })}
          {list.value.length < props.maxCount && (
            <div
              class="inc-btn"
              style={{
                width: `calc((100% - 4% * ${props.rowCount - 1}) / ${props.rowCount})`,
                paddingBottom: `calc((100% - 4% * ${props.rowCount - 1}) / ${props.rowCount})`
              }}
              onClick={chooseImage}
            >
              <div class="btn-cnt">
                <Icon class="icon" name="camera" />
              </div>
            </div>
          )}
        </div>
      )
    }
  }
})
