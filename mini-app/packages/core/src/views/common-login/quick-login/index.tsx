import { computed, defineComponent, onBeforeUnmount, onMounted, PropType, ref } from 'vue'
import './style.scss'
import Iconfont from '../../../components/iconfont'
import { useAppStore, useUserStore } from '../../../stores'
import { Button, Input } from '@tarojs/components'
import Code from './code'
import Taro, { useRouter } from '@tarojs/taro'
import { useToast, useResponseMessage, useLoading, useLoadingEnd } from '../../../hooks'
import { test, encryptPhoneNumber } from '@pkg/utils'
import { sendMessageCode,authMessageCode } from '../../../api'
import { $getWxOauthURL, loginWithToken, wxAuthLogin, wxBind } from '../../../api'
import { Icon } from '@pkg/ui'
import { navigateTo, redirectTo } from '../../../utils'
import { storeToRefs } from 'pinia'

declare const wx: any

function buildUrl(url, query) {
  const queryString = new URLSearchParams(query).toString()
  return queryString ? `${url}?${queryString}` : url
}

const STEP_INDEX = 0
const STEP_MOBILE = 1
const STEP_CODE = 2

export default defineComponent({
  name: 'C_QuickLogin',
  props: {
    cancelText: {
      type: String,
      default: '暂不登录，先去逛逛'
    },
    reload: {
      type: Boolean,
      default: true
    },
    userAgreement: {
      type: Object as PropType<{ name: string; handler: () => void }>,
      default: () => {
        return {
          name: '《用户服务协议》',
          handler: () => {
            Taro.openPrivacyContract()
          }
        }
      }
    }
  },
  emits: {
    cancel: () => true
  },
  setup(props, { emit, slots }) {
    const appStore = useAppStore()
    const { isInNativeWebView } = storeToRefs(appStore)
    const noQuickLogin = computed(() => {
      if (process.env.TARO_ENV === 'weapp') {
        return false
      }
      
      // app webview 不显示快捷登录
      return isInNativeWebView.value
    })

    const callbackURL = decodeURIComponent(useRouter().params.callbackURL || '')
    const callback = (token: string) => {
      setTimeout(() => {
        const isLoginPath = useRouter().path.includes('login')
        ;(isLoginPath ? redirectTo : navigateTo)({
          url: `/packageMain/web?url=${encodeURIComponent(`${callbackURL}?ba=${token}&backToMiniProgram=true`)}`
        })
      }, 300)
    }

    /** 关闭页面/弹窗 */
    const cancel = () => {
      emit('cancel')
    }

    /** 当前步骤 */
    const stepRef = ref(noQuickLogin.value ? STEP_MOBILE : STEP_INDEX)

    const hasAuthWechat = Taro.getStorageSync('has-auth-weapp') === 'true'

    /** 是否为绑定手机号步骤 */
    const isBind = ref(false)

    /** 手机号，默认为上次登录的 */
    const phoneRef = ref(Taro.getStorageSync('last-login-mobile') || '')
    let lastSendCodePhone = ''

    /** 验证码 */
    const codeRef = ref('')

    /** 验证码id */
    const smsId = ref('')

    /** 勾选用户协议 */
    const hasAgreed = ref(false)
    const toggleAgree = () => {
      hasAgreed.value = !hasAgreed.value
    }
    const checkAgree = () => {
      if (!hasAgreed.value) {
        useToast('请先同意相关协议')
      }
      return hasAgreed.value
    }

    const Agreement = () => {
      return (
        <div class="c_quick-login__user-agreement">
          <div class={['checkbox', hasAgreed.value && 'active']} onClick={toggleAgree}>
            <Icon name="check-small" />
          </div>
          <span class="label" onClick={toggleAgree}>
            我已阅读并同意
          </span>
          <span
            class="link"
            onClick={() => {
              props.userAgreement.handler()
            }}
          >
            {props.userAgreement.name}
          </span>
        </div>
      )
    }

    /** 倒计时，单位 s */
    const countdownRef = ref(0)

    /** 倒计时定时器 */
    let countdownTimer: NodeJS.Timer

    /** 开始倒计时 */
    const countdown = () => {
      countdownRef.value--
      if (countdownRef.value > 0) {
        countdownTimer = setTimeout(countdown, 1000)
      }
    }
    const resetCountDown = () => {
      countdownRef.value = 60
      countdown()
    }

    // 卸载时清除倒计时计时器
    onBeforeUnmount(() => {
      clearTimeout(countdownTimer)
    })

    const fetchCode = () => {
      if (!checkAgree()) {
        return void 0
      }
      // 手机号不变，且在倒计时中，直接跳入验证码页，在里面显示重新获取倒计时
      if (countdownRef.value > 0 && phoneRef.value === lastSendCodePhone) {
        stepRef.value = STEP_CODE
        return void 0
      }
      if (!test.mobile(phoneRef.value)) {
        useToast('请输入正确的手机号')
        return
      }
      Taro.showLoading()
      sendMessageCode(phoneRef.value)
        .then(res => {
          Taro.hideLoading()
          if (res.code === 200) {
            useToast(res.msg || '短信验证已发送')
            lastSendCodePhone = phoneRef.value
            smsId.value = res.data.id
            resetCountDown()
            stepRef.value = STEP_CODE
          } else {
            useResponseMessage(res)
          }
        })
        .catch(err => {
          Taro.hideLoading()
          useToast(err.response?.data?.msg || err.message || '验证码发送失败，请重试')
        })
    }

    const smsLogin = () => {
      if (!test.mobile(phoneRef.value)) {
        useToast('请输入正确的手机号')
        return void 0
      }
      if (!test.code(codeRef.value)) {
        useToast('请输入6位数字验证码')
        return void 0
      }
      if (!checkAgree()) {
        return void 0
      }
      Taro.showLoading()
      authMessageCode({
        phone: phoneRef.value,
        smsId: smsId.value,
        code: codeRef.value
      })
        .then((res: any) => {
          Taro.setStorageSync('Blade-Auth', `${res.token_type} ${res.access_token}`)
          useUserStore()
            .getUserInfo()
            .then(() => {
              Taro.hideLoading()
              useToast('登录成功')
              countdownRef.value = 0
              clearTimeout(countdownTimer)
              Taro.setStorageSync('last-login-mobile', phoneRef.value)

              if (props.reload) {
                // 重载此页面
                if (process.env.TARO_ENV === 'h5') {
                  window.location.reload()
                } else {
                  const router = useRouter()
                  Taro.redirectTo({
                    url: buildUrl(router.path, router.params)
                  })
                }
              } else if (callbackURL) {
                callback(res.access_token)
              }
            })
            .catch(err => {
              Taro.hideLoading()
              useToast(err.response?.data?.msg || err.message || '登录失败，请重试')
            })
        })
        .catch(err => {
          useToast(
            err.response?.data?.msg || err.response?.data?.error_description || err.message || '登录失败，请重试'
          )
        })
    }

    /** 需要绑定手机号 */
    const needBindPhoneNumber = ref(false)
    /** 需先同意微信隐私授权 */
    const needPrivacyAgree = ref(false)
    /** 获取一键登录信息失败 */
    const quickLoginError = ref(false)
    const openId = ref('')
    const directToken = ref('')

    /** 微信授权登录 */
    const handleAuth = () => {
      Taro.showLoading()
      wx.login({
        success: res => {
          wxAuthLogin(res.code)
            .then((res: any) => {
              openId.value = res.data?.openid
              directToken.value = res.data?.directToken
              if (res.data?.status === 1) {
                // 后端返回可直接登录的令牌，立即执行登录
                if (directToken.value) {
                  handleAuthLogin(directToken.value)
                }
              } else if (res.data?.status === 2) {
                needBindPhoneNumber.value = true
              } else {
                quickLoginError.value = true
              }
            })
            .catch(err => {
              quickLoginError.value = true
              useResponseMessage(err)
            })
            .finally(() => {
              Taro.hideLoading()
            })
        },
        fail: err => {
          Taro.hideLoading()
          console.log('wx.login调用失败：', err)
          useToast('wx.login调用失败')
          quickLoginError.value = true
        }
      })
    }

    onMounted(() => {
      if (process.env.TARO_ENV === 'weapp') {
        if (hasAuthWechat) {
          // 之前用过一键登录，点击时再加载
          return void 0
        }
        // 检测是否需要隐私授权提示
        try {
          wx.getPrivacySetting({
            success: res => {
              needPrivacyAgree.value = !!res?.needAuthorizationNotification
            }
          })
        } catch (e) {}
        handleAuth()
      }
    })

    /** 使用手机号实时验证组件（getRealtimePhoneNumber）回调 */
    const onGetRealtimePhonenumber = e => {
      console.log('使用快速获取手机号组件：', e)
      if (!e.detail.code) {
        const sys = Taro.getSystemInfoSync?.() || { platform: '' }
        const isDevtools = sys.platform === 'devtools'
        const errMsg = e.detail.errMsg || ''
        let msg = '授权失败，请重试'
        if (errMsg.includes('no permission')) {
          msg = isDevtools ? '开发工具无法获取手机号，请在真机测试' : '请在微信弹窗同意隐私授权后重试'
          try {
            wx.getPrivacySetting({
              success: res => {
                needPrivacyAgree.value = !!res?.needAuthorizationNotification
              }
            })
          } catch (err) {}
        }
        useToast(msg)
        needBindPhoneNumber.value = true
        return void 0
      }
      Taro.showLoading()
      wxBind(openId.value, e.detail.code)
        .then(res => {
          directToken.value = res.data?.directToken
          if (res.data?.status === 1) {
            handleAuthLogin(directToken.value)
          } else {
            Taro.hideLoading()
            useResponseMessage(res)
            needBindPhoneNumber.value = true
          }
        })
        .catch(err => {
          Taro.hideLoading()
          useResponseMessage(err)
          needBindPhoneNumber.value = true
        })
    }

    const openPrivacy = () => {
      try {
        // @ts-ignore
        Taro.openPrivacyContract?.()
      } catch (err) {
        try {
          wx.openPrivacyContract?.()
        } catch (e2) {}
      }
    }

    const handleAuthLogin = (token: string) => {
      // 去除一键登录的协议勾选前置条件

      if (quickLoginError.value) {
        useToast('当前无法进行一键登录，请使用手机号登录')
        stepRef.value = STEP_MOBILE
        return void 0
      }

      if (process.env.TARO_ENV === 'h5') {
        const onError = () => {
          useToast('请使用手机号登录')
          stepRef.value = STEP_MOBILE
        }

        // 尝试公众号授权登录
        useLoading()
        $getWxOauthURL(location.href)
          .then(res => {
            if (res.code === 200) {
              useLoadingEnd()
              window.location.href = res.data
            } else {
              onError()
            }
          })
          .catch(onError)
          .finally(() => {
            useLoadingEnd()
          })

        return void 0
      }

      Taro.showLoading()

      loginWithToken(token)
        .then((res: any) => {
          // loginWithToken 已完成本地存储设置，这里不再重复设置
          useUserStore()
            .getUserInfo()
            .then(() => {
              Taro.hideLoading()
              useToast('登录成功')
              countdownRef.value = 0
              clearTimeout(countdownTimer)
              Taro.setStorageSync('has-auth-weapp', 'true')

              if (props.reload) {
                // 重载此页面
                if (process.env.TARO_ENV === 'h5') {
                  window.location.reload()
                } else {
                  const router = useRouter()
                  Taro.redirectTo({
                    url: buildUrl(router.path, router.params)
                  })
                }
              } else if (callbackURL) {
                callback(res.access_token)
              }
            })
            .catch(err => {
              Taro.hideLoading()
              useToast(err.response?.data?.msg || err.message || '登录失败，请重试')
            })
        })
        .catch(err => {
          useToast(
            err.response?.data?.msg || err.response?.data?.error_description || err.message || '登录失败，请重试'
          )
        })
    }

    const onConfirm = () => {
      if (isBind.value) {
      } else {
        smsLogin()
      }
    }

    return () => {
      return (
        <>
          <div
            class={[
              'c_quick-login__subpage index',
              stepRef.value >= STEP_INDEX && 'active',
              stepRef.value > STEP_INDEX && 'darken'
            ]}
          >
            {slots.default?.()}
            {needBindPhoneNumber.value ? (
              <>
                <div
                  class="c_quick-login__button"
                  style={{ marginBottom: '12px' }}
                >
                  同意隐私授权
                  <Button class="c_quick-login__button-oepn-type" openType="agreePrivacyAuthorization" />
                </div>
                <div class="c_quick-login__button" style={{ marginBottom: '12px' }}>
                  一键登录
                  <button
                    class="c_quick-login__button-oepn-type"
                    openType="getRealtimePhoneNumber"
                    bindgetrealtimephonenumber="getrealtimephonenumber"
                    onGetrealtimephonenumber={onGetRealtimePhonenumber}
                  />
                </div>
                <div
                  class="c_quick-login__privacy-link"
                  style={{ margin: '8px 0 16px', textAlign: 'center', fontSize: '12px', color: '#999' }}
                  onClick={openPrivacy}
                >
                  查看并同意微信隐私保护指引
                </div>
              </>
            ) : (
              <div
                class="c_quick-login__button"
                onClick={() => {
                  // 统一走授权流程，避免依赖历史状态或直通 token
                  console.log('[QuickLogin] 点击一键登录，开始调用 wx.login')
                  useToast('正在发起微信授权…')
                  handleAuth()
                }}
              >
                一键登录
              </div>
            )}

            <Agreement />
            <div
              class="c_quick-login__mobile"
              onClick={() => {
                if (!checkAgree()) return void 0
                stepRef.value = STEP_MOBILE
              }}
            >
              <Iconfont name="phone" />
              手机号登录
            </div>
            <div class="c_quick-login__skip" onClick={cancel}>
              {props.cancelText}
            </div>
          </div>

          {/* 输入手机号 */}
          <div
            class={[
              'c_quick-login__subpage',
              stepRef.value >= STEP_MOBILE && 'active',
              stepRef.value > STEP_MOBILE && 'darken'
            ]}
            // style={{
            //   paddingTop: `${appStore.commonNavigatorHeight}px`
            // }}
          >
            <div
              class="c_quick-login__subpage-nav p_login-close"
              onClick={() => {
                if (noQuickLogin.value) {
                  cancel()
                  return void 0
                }
                stepRef.value = STEP_INDEX
              }}
            >
              <Iconfont name="back" />
            </div>
            <div class="c_quick-login__title">{isBind.value ? '绑定手机号' : '请输入手机号'}</div>
            <div class="c_quick-login__subtitle">
              {isBind.value ? '首次使用微信登录需先绑定手机号' : '我们将通过短信向您发送验证码'}
            </div>
            <div class="c_quick-login__mobile-input number-font">
              <div class="zone-code number-font">+86</div>
              {
                <Input
                  class="input number-font"
                  placeholderClass="c_quick-login__input-placeholder"
                  placeholder="请输入手机号码"
                  maxlength={11}
                  type="digit"
                  value={phoneRef.value}
                  focus={stepRef.value === STEP_MOBILE}
                  onInput={e => {
                    phoneRef.value = e.detail.value
                  }}
                />
              }
              {phoneRef.value.length > 0 && (
                <div
                  class="clear"
                  onClick={() => {
                    phoneRef.value = ''
                  }}
                >
                  <Iconfont name="close" />
                </div>
              )}
            </div>
            <div class="c_quick-login__button" onClick={fetchCode}>
              获取验证码
            </div>
            <div style="margin:32px 0;">
              <Agreement />
            </div>
          </div>

          {/* 输入验证码 */}
          <div
            class={['c_quick-login__subpage', stepRef.value >= STEP_CODE && 'active']}
            // style={{
            //   paddingTop: `${appStore.commonNavigatorHeight}px`
            // }}
          >
            <div
              class="c_quick-login__subpage-nav p_login-close"
              onClick={() => {
                stepRef.value = STEP_MOBILE
              }}
            >
              <Iconfont name="back" />
            </div>
            <div class="c_quick-login__title">请输入验证码</div>
            <div class="c_quick-login__subtitle number-font">
              已将验证码发送至{encryptPhoneNumber(phoneRef.value) || '您的手机号'}，
              {countdownRef.value > 0 ? (
                <div class="c_quick-login__countdown">重新发送 ( {countdownRef.value}s )</div>
              ) : (
                <div class="c_quick-login__countdown" onClick={fetchCode}>
                  重新发送
                </div>
              )}
            </div>
            <div class="c_quick-login__code">
              {stepRef.value >= STEP_CODE && (
                <Code
                  value={codeRef.value}
                  onChange={value => {
                    codeRef.value = value
                  }}
                />
              )}
            </div>
            {/* <div>{codeRef.value}</div> */}
            <div class="c_quick-login__button" onClick={onConfirm}>
              {isBind.value ? '立即绑定' : '立即登录'}
            </div>
          </div>
        </>
      )
    }
  }
})
