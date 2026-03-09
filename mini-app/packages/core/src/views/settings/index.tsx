import { BasePage, navigateBack, navigateTo, useLogin, useToast, useUpdateManager, useUserStore } from '@pkg/core'
import { defineComponent } from 'vue'
import './style.scss'
import { Image, Button as NativeButton } from '@tarojs/components'
import Icon from '@pkg/ui/src/components/icon'
import { storeToRefs } from 'pinia'
import Taro from '@tarojs/taro'
import { onUpdateUserAvatar } from './avatar'
import { onUpdateUserNickname } from './nickname'

definePageConfig({
  navigationStyle: 'custom'
})

export const Settings = defineComponent({
  name: 'ProfileEditPage',
  props: {
    version: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const userStore = useUserStore()
    const { isLogin, avatar, nickname, isWechatBind, userProfileEditable, isUserProfileNeedComplete } =
      storeToRefs(userStore)

    const toProfileSettings = () => {
      navigateTo({
        url: '/packageOther/profile-settings/index'
      })
    }

    return () => {
      return (
        <BasePage navigator={{ title: '账号设置' }}>
          <div class="profile-edit-page">
            {isLogin.value && (
              <div class="blocks">
                <div
                  class="item"
                  onClick={() => {
                    onUpdateUserAvatar()
                  }}
                >
                  <div class="label">头像</div>
                  <Image class="value avatar" src={avatar.value} />
                  <Icon class="arrow" name="right" />
                </div>
                <div class="item" onClick={onUpdateUserNickname}>
                  <div class="label">昵称</div>
                  <div class="value nickname">{nickname.value}</div>
                  <Icon class="arrow" name="right" />
                </div>
                {process.env.TARO_ENV === 'weapp' && isLogin.value && (
                  <div class="item" onClick={() => userStore.bindWechat()}>
                    <div class="label">
                      <Image
                        class="logo"
                        src="https://cdn.ice.cn/upload/20240903/36235b059bdff7f28a6f21de0b7dde38.svg"
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
                {userProfileEditable.value && (
                  <div class="item" onClick={toProfileSettings}>
                    <div class="label">
                      个人资料
                      <div class="small">含人脸识别、地区等内容</div>
                    </div>
                    {isUserProfileNeedComplete.value ? (
                      <div class="value color-info">需要完善，去设置</div>
                    ) : (
                      <div class="value placeholder">去设置</div>
                    )}

                    <Icon class="arrow" name="right" />
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
                  Taro.openPrivacyContract()
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
                <div class="value">当前版本 v{props.version}</div>
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
