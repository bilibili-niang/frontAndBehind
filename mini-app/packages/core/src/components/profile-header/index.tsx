import { defineComponent } from 'vue'
import { useUserStore } from '../../stores'
import { storeToRefs } from 'pinia'
import { DEFAULT_AVATAR } from '@pkg/config'
import { useLogin } from '../../hooks'
import { Icon } from '@pkg/ui'
import './style.scss'
import { navigateTo } from '../../utils'

export const CommonProfileHeader = defineComponent({
  name: 'CommonProfileHeader',
  setup() {
    const userStore = useUserStore()
    const { isLogin, avatar, nickname, phone } = storeToRefs(userStore)

    const navigateToSettings = () => {
      navigateTo({
        url: '/packageOther/settings/index'
      })
    }

    return () => {
      return (
        <div class="common-profile-header">
          {isLogin.value ? (
            <>
              <div class="user-info" onClick={navigateToSettings}>
                <img class="user-avatar" src={avatar.value || DEFAULT_AVATAR} />
                <div class="user-info-text">
                  <div class="user-nickname">{nickname.value}</div>
                  <div class="user-mobile">{phone.value}</div>
                </div>
              </div>
              <ProfileSettings />
            </>
          ) : (
            <div class="user-info" onClick={() => useLogin()}>
              <img class="user-avatar" src={DEFAULT_AVATAR} />
              <div class="user-info-text">
                <div class="user-nickname">立即登录</div>
                <div class="user-mobile">获取更多优质服务</div>
              </div>
            </div>
          )}
        </div>
      )
    }
  }
})

const ProfileSettings = defineComponent({
  setup() {
    const userStore = useUserStore()
    const { userProfileEditable, isUserProfileNeedComplete, userProfileProgress, isNeedFaceImage } =
      storeToRefs(userStore)

    const toProfileSettings = () => {
      navigateTo({
        url: '/packageOther/profile-settings/index'
      })
    }

    return () => {
      if (!userProfileEditable.value) return null

      const ratio = Math.floor(userProfileProgress.value * 100)

      return (
        <div class="user-profile-settings-banner" onClick={toProfileSettings}>
          <div
            class={['progress', ratio >= 100 && 'complete']}
            style={{
              '--ratio': ratio + '%'
            }}
          >
            {ratio >= 100 && <Icon name="ok-bold" />}
          </div>
          <div class="text">
            <div class="title">个人信息</div>
            <div class="desc">资料完善度 {ratio}％</div>
          </div>
          <div class="button">{isUserProfileNeedComplete.value ? '去完善' : '去修改'}</div>

          {isNeedFaceImage.value && (
            <div class="bubble">
              <div class="icon"></div>
              <div class="bubble-text">录入人脸识别</div>
              <div class="anchor"></div>
            </div>
          )}
        </div>
      )
    }
  }
})
