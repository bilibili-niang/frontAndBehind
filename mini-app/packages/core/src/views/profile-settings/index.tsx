import { computed, defineComponent, onMounted, ref } from 'vue'
import BasePage from '../../components/base-page'
import './style.scss'
import { useUserStore } from '../../stores'
import { storeToRefs } from 'pinia'
import { Icon } from '@pkg/ui'
import { useResponseMessage } from '../../hooks'
import Name from './fields/name'
import { $updateUserProfile } from '../../api'
import Birthday from './fields/birthday'
import Gender from './fields/gender'
import Address from './fields/address'
import { FiledType } from './types'
import Spin from '../../components/spin'
import { onUpdateUserAvatar } from '../settings/avatar'
import EmptyStatus from '../../components/empty-status'
import { COMMON_STATUS_ON } from '@pkg/config'
import { uuid } from '@pkg/utils'

const fieldWidgets = {
  [FiledType.name]: Name,
  [FiledType.gender]: Gender,
  [FiledType.birthday]: Birthday,
  [FiledType.address]: Address
}

if (process.env.TARO_APP_SCENE === 'venue') {
  fieldWidgets[FiledType.faceImage] = require('./fields/face').default
}

export const ProfileSettings = defineComponent({
  name: 'ProfileSettings',
  setup() {
    const pageKey = ref(uuid())
    const userStore = useUserStore()
    const { avatar, userProfile, userProfileEditable, userProfileFields, isUserProfileConfigLoading } =
      storeToRefs(userStore)

    onMounted(() => {
      userStore.getUserProfile()
      userStore.getUserProfileConfig()
    })

    const permission = computed(() => {
      return {
        /** 允许自定义上传头像 */
        avatarCustomizable: true
      }
    })

    const onItemChange = (key: string, value: any) => {
      userProfile.value[key] = value
      commit()
    }

    const isSyncLoading = ref(false)
    const Title = () => {
      return (
        <div class={['profile-settings__title', isSyncLoading.value && 'loading']}>
          <div class="loading-content">
            同步中
            <div class="spin"></div>
          </div>
          <div class="text">个人信息</div>
        </div>
      )
    }

    const commit = () => {
      isSyncLoading.value = true
      // setTimeout(() => {
      //   isSyncLoading.value = false
      // }, 600)

      $updateUserProfile(userProfile.value)
        .then(res => {
          if (res.code !== 200) {
            useResponseMessage(res)
            userStore.getUserProfile().finally(() => {
              pageKey.value = uuid()
            })
          }
        })
        .catch(err => useResponseMessage(err))
        .finally(() => {
          isSyncLoading.value = false
        })
    }

    const PageContent = () => {
      if (isUserProfileConfigLoading.value) {
        return (
          <div class="profile-settings-loading">
            <Spin />
          </div>
        )
      }

      if (!userProfileEditable.value) {
        return (
          <div class="profile-settings-loading">
            <EmptyStatus title="无法修改" description="平台未开启此功能／维护中" />
          </div>
        )
      }

      return (
        <div class="profile-settings">
          <div
            class="avatar-wrap"
            onClick={() =>
              onUpdateUserAvatar({
                avatarCustomizable: permission.value.avatarCustomizable
              })
            }
          >
            <div class="avatar">
              <div
                class="avatar-image"
                style={{
                  backgroundImage: `url(${avatar.value})`
                }}
              ></div>
            </div>
            <Icon name="edit" />
          </div>

          <div class="profile-settings__form">
            {userProfileFields.value.map((item, index, arr) => {
              const Comp = fieldWidgets[item.key]
              if (!Comp) return null
              const value = userProfile.value[item.key]
              return (
                <>
                  <Comp
                    required={item.required === COMMON_STATUS_ON}
                    value={value}
                    onChange={(v: any) => onItemChange(item.key, v)}
                  />
                  {index < arr.length - 1 && <div class="profile-settings__form-hr"></div>}
                </>
              )
            })}
          </div>
          <div class="profile-settings__tips">
            <Icon name="info" />
            &nbsp; 平台会妥善保护您的隐私安全
          </div>
        </div>
      )
    }

    return () => {
      return (
        <BasePage
          needLogin
          navigator={{
            title: <Title />,
            fixedTitle: <Title />,
            navigatorStyle: 'immersive',
            navigationBarBackgroundColor: 'transparent'
          }}
        >
          <PageContent key={pageKey.value} />
        </BasePage>
      )
    }
  }
})
