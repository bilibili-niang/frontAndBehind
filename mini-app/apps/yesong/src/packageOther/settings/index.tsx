import {
  BasePage,
  navigateBack,
  navigateTo,
  useLoading,
  useLoadingEnd,
  useLogin,
  useToast,
  useUpdateManager,
  useUploadFile,
  useUserAgreement,
  useUserStore
} from '@pkg/core'
import { computed, defineComponent } from 'vue'
import './style.scss'
import { Image, Button as NativeButton } from '@tarojs/components'
import Icon from '@pkg/ui/src/components/icon'
import { storeToRefs } from 'pinia'
import Taro from '@tarojs/taro'
import { useGlobalStore } from '../../stores'
import { ROUTE_SETTINGS_NICKNAME } from '../../router/routes'
import useSystemPageStore from '../../stores/system-page'

definePageConfig({
  navigationStyle: 'custom'
})

export default defineComponent({
  name: 'ProfileEditPage',
  setup() {
    const globalStore = useGlobalStore()
    const userStore = useUserStore()
    const { isLogin, avatar, nickname, isWechatBind } = storeToRefs(userStore)

    const avatarEditAble = computed(() => {
      try {
        if (process.env.TARO_APP_ID === 'wx67f9cc1e2d8e9364') {
          return false
        }
      } catch (err) {}
      return true
    })

    const onChooseAvatar = res => {
      if (!avatarEditAble.value) {
        useToast('暂不支持修改头像')
        return void 0
      }
      useLoading()
      useUploadFile({
        url: res.detail.avatarUrl,
        onSuccess: url => {
          userStore
            .setUserProfile({
              avatar: url
            })
            .finally(() => {
              useLoadingEnd()
            })
        },
        onFail: () => {
          useLoadingEnd()
          useToast('图片上传失败')
        }
      })
    }

    const toNicknameSettings = () => {
      if (!avatarEditAble.value) {
        useToast('暂不支持修改昵称')
        return void 0
      }
      navigateTo({
        url: ROUTE_SETTINGS_NICKNAME
      })
    }

    return () => {
      return (
        <BasePage navigator={{ title: '账号设置' }}>
          <div class="profile-edit-page">
            {isLogin.value && (
              <div class="blocks">
                <div class="item">
                  <div class="label">头像</div>
                  <Image class="value avatar" src={avatar.value} />
                  {avatarEditAble.value && (
                    <>
                      <NativeButton class="open-button" openType="chooseAvatar" onChooseavatar={onChooseAvatar} />
                      <Icon class="arrow" name="right" />
                    </>
                  )}
                </div>
                <div class="item" onClick={toNicknameSettings}>
                  <div class="label">昵称</div>
                  <div class="value nickname">{nickname.value}</div>
                  <Icon class="arrow" name="right" />
                </div>
                {process.env.TARO_ENV === 'weapp' && isLogin.value && (
                  <div class="item" onClick={() => userStore.bindWechat()}>
                    <div class="label">
                      <Image
                        class="logo"
                        src="https://cdn.anteng.cn/upload/20240903/36235b059bdff7f28a6f21de0b7dde38.svg"
                      />
                      绑定微信
                    </div>
                    {isWechatBind.value ? (
                      <>
                        <div class="value nickname">已绑定</div>
                        <Icon class="arrow" name="check-small" />
                      </>
                    ) : (
                      <>
                        <div class="value nickname">点击绑定</div>
                        <Icon class="arrow" name="right" />
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
            <div class="blocks">
              <div
                class="item"
                onClick={() => {
                  Taro.chooseAddress()
                }}
              >
                <div class="label">地址管理</div>
                <Icon class="arrow" name="right" />
              </div>
              <div class="item">
                <div class="label">权限设置</div>
                <NativeButton class="open-button" openType="openSetting" />
                <Icon class="arrow" name="right" />
              </div>
              <div class="item">
                <div class="label">帮助与反馈</div>
                <NativeButton class="open-button" openType="feedback" />
                <Icon class="arrow" name="right" />
              </div>
              <div class="item">
                <div class="label">客服</div>
                <NativeButton class="open-button" openType="contact" />
                <Icon class="arrow" name="right" />
              </div>
            </div>
            <div class="blocks">
              <div
                class="item"
                onClick={() => {
                  try {
                    useUserAgreement(useSystemPageStore().userAgreementPage.decorate.payload.page)
                  } catch (err) {
                    Taro.openPrivacyContract()
                  }
                }}
              >
                <div class="label">用户服务协议</div>
                <Icon class="arrow" name="right" />
              </div>
              <div
                class="item"
                onClick={() => {
                  Taro.openPrivacyContract()
                }}
              >
                <div class="label">用户隐私保护指引</div>
                <Icon class="arrow" name="right" />
              </div>
              <div class="item" onClick={useUpdateManager}>
                <div class="label">检测更新</div>
                <div class="value">当前版本 v{globalStore.version}</div>
                <Icon class="arrow" name="right" />
              </div>
            </div>
            {isLogin.value ? (
              <div
                class="logout"
                onClick={() => {
                  useUserStore().logout({
                    onSuccess: () => {
                      navigateBack()
                      setTimeout(() => {
                        useToast('已安全退出登录')
                      }, 332)
                    }
                  })
                }}
              >
                退出登录
              </div>
            ) : (
              <div
                class="login"
                onClick={() => {
                  useLogin()
                }}
              >
                立即登录
              </div>
            )}
          </div>
        </BasePage>
      )
    }
  }
})
