import { defineComponent, ref, watch } from 'vue'
import ImageUploader from '../../../components/image-uploader'
import Wrap, { commonProfileWidgetPropsDefine } from '../wrap'
import './face.scss'
import {
  useConfirm,
  useLoading,
  useModal,
  useModalActions,
  usePreviewImages,
  useResponseMessage,
  useToast,
  useUploadFile
} from '../../../hooks'
import request from '../../../api/request'
import { useLoadingEnd } from '../../../hooks/useLoading/index'
import { Icon } from '@anteng/ui'
import { Camera, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { uuid } from '@anteng/utils'

const check = (url: string) => {
  return request({
    url: '/anteng-venue-wap/m/userFaceImg/check',
    method: 'post',
    data: {
      faceImageUrl: url
    }
  })
}

export default defineComponent({
  props: {
    ...commonProfileWidgetPropsDefine
  },
  setup(props) {
    const image = ref<string>(props.value ?? '')

    const uploader = ref()
    const onUpload = () => {
      if (process.env.TARO_ENV !== 'h5') {
        if (image.value && !errorMsg.value) {
          useToast('暂不支持修改')
          return void 0
        }
        return useUploadFaceImage({
          url: image.value,
          onSuccess(url) {
            if (image.value !== url) {
              image.value = url
              // props.onChange?.(image.value)
            }
          }
        })
      } else {
        if (image.value) {
          if (!errorMsg.value) {
            useToast('暂不支持修改')
            return void 0
          }

          useConfirm({
            title: '重新上传',
            content: '确定要删除当前图片重新上传吗？',
            onConfirm: () => {
              uploader.value.clear()
              image.value = ''
              uploader.value.chooseImage()
            }
          })
        } else {
          uploader.value.clear()
          uploader.value.chooseImage()
        }
      }
    }

    const errorMsg = ref('')

    const onChange = (v: string[]) => {
      image.value = v[0]
      // props.onChange?.(image.value)
    }

    const onCheck = (retry = false) => {
      errorMsg.value = ''
      if (image.value) {
        useLoading()
        setTimeout(
          () => {
            check(image.value)
              .then(res => {
                if (res.code == 200) {
                  props.onChange?.(image.value)
                } else {
                  errorMsg.value = res.msg
                  // if (props.value) {
                  //   // 如果有设置了，删除？
                  //   props.onChange?.('')
                  // }
                }
              })
              .catch(err => {
                errorMsg.value = err.response?.data.message || err.message
              })
              .finally(useLoadingEnd)
          },
          retry ? 1000 : 0
        )
      }
    }

    watch(
      () => image.value,
      () => onCheck()
    )

    return () => {
      return (
        <Wrap
          // @ts-ignore
          label={
            <div>
              人脸识别
              <div class="tips face-image-uploader__tips">
                <div>仅在道闸入场识别时使用</div>
                {errorMsg.value && (
                  <>
                    <div class="color-error">
                      <Icon name="close-round-fill" />
                      &nbsp;
                      {errorMsg.value}
                    </div>
                    <div style="pointer-events:all" onClick={() => onCheck(true)}>
                      <Icon name="refresh" />
                      &nbsp;重试
                    </div>
                  </>
                )}
              </div>
            </div>
          }
          required={props.required}
          v-slots={{
            append: () => {
              if (process.env.TARO_ENV === 'h5') {
                return (
                  <div class="face-image-uploader">
                    <ImageUploader
                      ref={uploader}
                      maxCount={1}
                      images={image.value ? [image.value] : []}
                      align="right"
                      onChange={onChange}
                    />
                  </div>
                )
              } else {
                return (
                  <div
                    class="face-image-uploader"
                    onClick={() => {
                      if (image.value) {
                        usePreviewImages({
                          urls: [image.value!]
                        })
                      } else {
                        onUpload()
                      }
                    }}
                  >
                    {image.value ? (
                      <Image class="face-image-uploader__image" mode="aspectFill" src={image.value} />
                    ) : (
                      <div class="face-image-uploader__image">未上传</div>
                    )}
                  </div>
                )
              }
            }
          }}
        >
          <div class={errorMsg.value && 'color-error'} onClick={onUpload}>
            {image.value ? '重新上传' : <div class="placeholder">请上传人脸图片</div>}
          </div>
        </Wrap>
      )
    }
  }
})

const wrongList = [
  { image: 'https://dev-cdn.anteng.cn/upload/d178ae48c32bbf64b78b814200971fb7.png', title: '非人物照' },
  { image: 'https://dev-cdn.anteng.cn/upload/52c255af8b03520e20a7998eec7ec1e2.png', title: '五官遮挡' },
  { image: 'https://dev-cdn.anteng.cn/upload/fba75213d9ac0c5192d9fd3504238dfd.png', title: '模糊不清' },
  { image: 'https://dev-cdn.anteng.cn/upload/f33233a3d89113f64fec04fe148796d6.png', title: '衣着不当' },
  { image: 'https://dev-cdn.anteng.cn/upload/30d455f94c5090b80ca3427969f69c88.png', title: '角度不正' },
  { image: 'https://dev-cdn.anteng.cn/upload/8fa4eae8b6ccf91d0367eb6d50aa79a1.png', title: '多人照片' }
]

const useUploadFaceImage = (options: { url?: string; onSuccess: (url: string) => void }) => {
  const onCamera = () => {
    modal.close()
    useFaceCapture({ ...options, onAlbum })
  }
  const onAlbum = () => {
    modal.close()
    Taro.chooseImage({
      sourceType: ['album'],
      count: 1,
      sizeType: ['original', 'compressed'],
      success: res => {
        useLoading()
        useUploadFile({
          url: res.tempFilePaths[0],
          onSuccess: url => {
            options.onSuccess(url)
            modal.close()
          },
          onFail: err => {
            useResponseMessage(err)
          },
          onComplete: () => {
            useLoadingEnd()
          }
        })
      }
    })
  }

  const modal = useExample(() => {
    return (
      <div class="actions">
        <div class="action" onClick={onAlbum}>
          <Icon name="add-round-fill" />
          相册选择
        </div>
        <div class="action" onClick={onCamera}>
          <Icon name="camera" />
          拍照上传
        </div>
      </div>
    )
  })
}

const useExample = (Actions?: () => any) => {
  const { Actions: DefaultActions } = useModalActions([
    {
      text: '我知道了',
      primary: true,
      onClick: () => {
        modal.close()
      }
    }
  ])

  const modal = useModal({
    height: 'auto',
    padding: 0,
    closeable: false,
    backgroundColor: '#fff',
    content: () => {
      return (
        <div class="use-upload-face-image">
          <div class="correct">
            <div class="title">正确示范</div>
            <div class="subtitle">请上传本人五官清晰照片</div>
            <div
              class="image"
              style="background-image:url('https://dev-cdn.anteng.cn/upload/f50faac6dee4de514bdee81be285a6a9.png')"
            >
              <div class="badge">
                <Icon name="check-fill" />
              </div>
            </div>
          </div>
          <div class="wrong">
            <div class="title">错误示范</div>
            <div class="list">
              {wrongList.map(item => {
                return (
                  <div class="item">
                    <div
                      class="image"
                      style={{
                        backgroundImage: `url(${item.image})`
                      }}
                    >
                      <div class="badge"></div>
                    </div>
                    <div class="subtitle">{item.title}</div>
                  </div>
                )
              })}
            </div>
          </div>
          {Actions ? <Actions /> : <DefaultActions />}
        </div>
      )
    }
  })
  return modal
}

const useFaceCapture = (options: { onSuccess: (url: string) => void; onAlbum: () => void }) => {
  const cameraId = `camera_${uuid()}`
  const position = ref<'front' | 'back'>('front')
  const onFlip = () => {
    position.value = position.value === 'back' ? 'front' : 'back'
    Taro.vibrateShort({
      type: 'medium'
    })
  }

  const onAlbum = () => {
    modal.close()
    options.onAlbum()
    Taro.vibrateShort({
      type: 'medium'
    })
  }

  const cameraCtx = Taro.createCameraContext(cameraId)
  const tempImagePath = ref()
  const taking = ref(false)
  const onShot = () => {
    if (taking.value) return void 0

    taking.value = true
    cameraCtx.takePhoto({
      // 这里用原图大小会不会超过设备限制？
      quality: 'original',
      success: res => {
        console.log(res)
        tempImagePath.value = res.tempImagePath
      },
      fail: err => {
        console.log(err)
      },
      complete: () => {
        taking.value = false
      }
    })
    Taro.vibrateShort({
      type: 'medium'
    })
  }

  const onRetry = () => {
    tempImagePath.value = ''
  }

  const onConfirm = () => {
    useLoading()
    useUploadFile({
      url: tempImagePath.value,
      onSuccess: url => {
        options.onSuccess(url)
        modal.close()
      },
      onFail: err => {
        useResponseMessage(err)
      },
      onComplete: () => {
        useLoadingEnd()
      }
    })
  }

  const cameraPermissionError = ref(false)
  const onCameraError = () => {
    cameraPermissionError.value = true
  }

  const checkPermission = () => {
    Taro.getSetting({
      success: res => {
        console.log(res)
        if (res.authSetting?.['scope.camera']) {
          cameraPermissionError.value = false
        }
      }
    })
  }

  Taro.onAppShow(checkPermission)

  const CameraContent = () => {
    if (cameraPermissionError.value) {
      return (
        <div class="use-face-capture__content">
          <div class="use-face-capture__error">
            <div>
              <Icon name="close-round-fill" /> 请打开相机权限
            </div>
            <div
              class="button"
              onClick={() => {
                Taro.openSetting()
              }}
            >
              去开启
            </div>
          </div>
        </div>
      )
    }

    return (
      <div class="use-face-capture__content">
        <div class="face-border">
          <div class="tips">
            <div>请将正脸保持在框内，并在光线充足情况下拍摄</div>
          </div>
        </div>
        <Camera id={cameraId} class="camera" devicePosition={position.value} onError={onCameraError} />
      </div>
    )
  }

  const modal = useModal({
    height: 'max',
    backgroundColor: '#000',
    className: 'use-face-capture-modal',
    onClose: () => {
      Taro.offAppShow(checkPermission)
    },
    content: () => {
      return (
        <div class="use-face-capture-wrap">
          <div class="use-face-capture">
            <div class="use-face-capture__title">人脸拍照上传</div>
            {tempImagePath.value ? (
              <div class="use-face-capture__content">
                <Image class="temp-image" src={tempImagePath.value} />
              </div>
            ) : (
              <CameraContent />
            )}
            <div class="use-face-capture__footer">
              {tempImagePath.value ? (
                <div class="use-face-capture__continue">
                  <div class="retry" onClick={onRetry}>
                    重新拍摄
                  </div>
                  <div class="confirm" onClick={onConfirm}>
                    确定使用
                  </div>
                </div>
              ) : (
                <>
                  <div class="album" onClick={onAlbum}>
                    <Image src="https://dev-cdn.anteng.cn/upload/0b855145f6f8807e0d7edfd173ea6ce1.svg" class="icon" />
                    <div class="text">相册选择</div>
                  </div>

                  <div class="shot" onTouchstart={onShot}></div>

                  <div class="flip" onClick={onFlip}>
                    <Image src="https://dev-cdn.anteng.cn/upload/29110fedc65828edf2e941f6edf96c54.svg" class="icon" />
                    <div class="text">翻转</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )
    }
  })
}
