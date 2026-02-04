import { BasePage, LaunchPage, useAppStore, usePrivacyAgreement } from '@pkg/core'
import { defineComponent, ref, watch } from 'vue'
import './launch.scss'
import { backToIndex } from '../router'
import { storeToRefs } from 'pinia'
import { useGlobalStore } from '../stores'
import useMerchantStore from '../stores/merchant'

definePageConfig({
  enableShareAppMessage: false,
  navigationStyle: 'custom'
})

export default defineComponent({
  name: 'launch-page',
  setup() {
    const globalStore = useGlobalStore()
    const appStore = useAppStore()

    appStore.setLoginPageContent(
      <div class="coupon-login-page-content">
        <div class="title1">欢迎登录</div>
        <div class="title2">卡猫微店</div>
      </div>
    )

    /** 已授权过隐私保护指引 */
    const hasAgreePrivacy = ref(false)
    if (process.env.TARO_ENV === 'h5') {
      hasAgreePrivacy.value = true
    } else {
      usePrivacyAgreement()
        .then(() => {
          hasAgreePrivacy.value = true
        })
        .catch(err => {
          console.error('获取隐私保护指引信息错误', err)
          // TODO
          hasAgreePrivacy.value = true
        })
    }

    const finish = () => {
      if (hasAgreePrivacy.value) {
        try {
          globalStore.redirectToLaunchRedirect()
        } catch (err) {
          console.error('重定向失败，默认打开首页')
          backToIndex()
        }

        useAppStore().init()
      } else {
        const stopWatch = watch(
          () => hasAgreePrivacy.value,
          () => {
            finish()
            stopWatch?.()
          }
        )
      }
    }

    const merchantStore = useMerchantStore()
    const { getMerchantIdError } = storeToRefs(merchantStore)
    const getMerchantInfo = async () => {
      try {
        await merchantStore.getMerchantInfo()
        return Promise.resolve()
      } catch (err) {
        console.error('获取商户信息失败：', err)
        return Promise.reject(err)
      }
    }

    Promise.allSettled([getMerchantInfo()])
      .then(() => {
        setTimeout(finish, 600)
      })
      .catch(err => {
        console.error(err)
      })

    return () => {
      if (getMerchantIdError.value) {
        return (
          <BasePage navigator={null}>
            <div class="launch-get-merchant-error">
              <div>AppID {appStore.accountInfo?.miniProgram.appId}</div>
              <div>获取商户信息失败</div>
              <div class="btn" onClick={getMerchantInfo}>
                重试
              </div>
            </div>
          </BasePage>
        )
      }
      return (
        <BasePage navigator={null}>
          <div class="launch-page">
            <LaunchPage>
              {{
                logo: () => (
                  <div class="launch-page__logo">
                    {/* <div class="launch-page__logo-image"></div> */}
                    {/* <div class="launch-page__logo-text">微店</div> */}
                  </div>
                )
              }}
            </LaunchPage>
          </div>
        </BasePage>
      )
    }
  }
})
