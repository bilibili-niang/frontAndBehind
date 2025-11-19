import { chunk } from 'lodash-es'
import avatarList from './avatar.json'
import { useLoading, useLoadingEnd, useModal, useToast, useUploadFile } from '../../hooks'
import { Swiper, Button as NativeButton, SwiperItem } from '@tarojs/components'
import { ref } from 'vue'
import Taro from '@tarojs/taro'
import './avatar.scss'
import { useUserStore } from '../../stores'

export const onUpdateUserAvatar = (options?: { avatarCustomizable?: boolean }) => {
  useChooseAvatar({
    avatarCustomizable: options?.avatarCustomizable,
    onSuccess: url => {
      useUserStore().setUserProfile({
        avatar: url
      })
    }
  })
}

export const useChooseAvatar = (options?: { avatarCustomizable?: boolean; onSuccess?: (url: string) => void }) => {
  const avatarCustomizable = process.env.TARO_ENV === 'h5' ? false : options?.avatarCustomizable ?? true

  const onChoose = (url: string) => {
    options?.onSuccess?.(url)
    modal.close()
    Taro.vibrateShort({
      type: 'medium'
    })
  }

  const group = chunk([...avatarList.animal, ...avatarList.emotion], 15)

  const onChooseAvatar = (res: any) => {
    useLoading()
    useUploadFile({
      url: res.detail.avatarUrl,
      onSuccess: url => {
        useLoadingEnd()
        onChoose(url)
      },
      onFail: () => {
        useLoadingEnd()
        useToast('图片上传失败')
      }
    })
  }

  const currentIndex = ref(0)

  const modal = useModal({
    title: '选择头像',
    height: 'auto',
    padding: 0,
    content: () => {
      return (
        <div class="choose-avatar-modal primary-color-blue">
          <Swiper
            class="swiper"
            current={currentIndex.value}
            onChange={e => (currentIndex.value = e.detail.current)}
            autoplay={false}
          >
            {group.map((list, index) => {
              const visible = index >= currentIndex.value - 1 && index <= currentIndex.value + 1
              return (
                <SwiperItem>
                  {visible && (
                    <div class="list">
                      {list.map(item => {
                        if (avatarCustomizable && (item as any).custom) {
                          return (
                            <div class="item custom">
                              <NativeButton
                                class="open-button"
                                openType="chooseAvatar"
                                onChooseavatar={onChooseAvatar}
                              />
                              自定义
                            </div>
                          )
                        }

                        return (
                          <div
                            class="item"
                            style={{
                              backgroundImage: `url(${item.url})`
                            }}
                            onClick={() => onChoose(item.url)}
                          ></div>
                        )
                      })}
                    </div>
                  )}
                </SwiperItem>
              )
            })}
          </Swiper>
          <div class="indicator">
            {group.map((item, index) => {
              return <div class={['i', index === currentIndex.value && 'active']}></div>
            })}
          </div>
          {/* <div class="actions">
            <div class="action">
              {avatarCustomizable && (
                <NativeButton class="open-button" openType="chooseAvatar" onChooseavatar={onChooseAvatar} />
              )}
              微信头像／相册选择
            </div>
            <div class="action">确定</div>
          </div> */}
        </div>
      )
    }
  })
}
