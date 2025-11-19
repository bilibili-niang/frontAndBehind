import urlParse from 'url-parse'
import { $postWxOauthBind, $postWxOauthLogin, loginWithToken, WX_OAUTH_KEY } from '../../api'
import useResponseMessage from '../useResponseMessage'
import useModal from '../useModal'
import { useLoading, useLoadingEnd } from '../useLoading'
import { onBeforeUnmount, ref } from 'vue'
import Iconfont from '../../components/iconfont'
import { Input } from '@tarojs/components'
import { encryptPhoneNumber, test } from '@anteng/utils'
import { VerifyCode } from '@anteng/ui'
import '../../views/common-login/quick-login/style.scss'
import './style.scss'
import useToast from '../useToast'
import { sendMessageCode } from '../../api'
import Taro from '@tarojs/taro'
import { useAppStore, useUserStore } from '../../stores'

const retry = () => {
  // 每间隔0.1秒轮询app初始化状态
  setTimeout(() => {
    checkWxOauth()
  }, 100)
}

export const checkWxOauth = () => {
  if (process.env.TARO_ENV === 'h5') {
    try {
      if (!useAppStore().initialized) {
        retry()
        return void 0
      }
    } catch (err) {
      retry()
      return void 0
    }

    console.log('检测微信授权回调')

    try {
      const href = window.location.href.replace(/&amp;/g, '&')
      const url = urlParse(href, true)
      if (url.query[WX_OAUTH_KEY] === 'true' && url.query.code) {
        const code = url.query.code
        delete url.query[WX_OAUTH_KEY]
        delete url.query.code
        // 替换链接，免刷新页面
        history.replaceState(null, '', url.toString())

        // console.log(href, url.toString())

        $postWxOauthLogin(code)
          .then(res => {
            if (res.data?.status === 1) {
              // 已经绑定过手机号，直接登录
              onLogin(res.data.directToken)
            } else if (res.data?.status === 2) {
              // 初次登录需要绑定手机号
              bindMobile(res.data.openid)
            } else {
              useResponseMessage(res)
            }
          })
          .catch(useResponseMessage)
      }
    } catch (err) {
      console.log('检测微信授权回调异常：', err)
    }
  }
}

const onLogin = (token: string) => {
  useLoading()
  loginWithToken(token)
    .then((res: any) => {
      Taro.setStorageSync('Blade-Auth', `${res.token_type} ${res.access_token}`)
      useUserStore()
        .getUserInfo()
        .then(() => {
          useToast('登录成功')

          // const router = useRouter()
          // Taro.redirectTo({
          //   url: buildUrl(router.path, router.params)
          // })
          // setTimeout(() => {
          //   useToast('登录成功')
          // }, 300)
        })
        .catch(err => {
          useToast(err.response?.data?.msg || err.message || '登录失败，请重试')
        })
        .finally(useLoadingEnd)
    })
    .catch(err => {
      useLoadingEnd()
      useToast(err.response?.data?.msg || err.response?.data?.error_description || err.message || '登录失败，请重试')
    })
}

const bindMobile = (openid: string) => {
  onMobileVerify({
    mobile: '',
    title: '绑定手机号',
    subtitle: '首次使用微信登录需先绑定手机号',
    confirmButtonText: '立即绑定',
    cancelButtonText: '取消登录',
    onConfirm: async payload => {
      return new Promise((resolve, reject) => {
        useLoading()
        $postWxOauthBind({
          openid,
          phone: payload.mobile,
          smsId: payload.smsId,
          value: payload.code
        })
          .then(res => {
            if (res.code === 200) {
              onLogin(res.data.directToken)
              resolve()
            } else {
              useResponseMessage(res)
              reject()
            }
          })
          .catch(err => {
            useResponseMessage(err)
            reject()
          })
          .finally(useLoadingEnd)
      })
    }
  })
}

const onMobileVerify = (options: {
  title?: string
  subtitle?: string
  confirmButtonText?: string
  cancelButtonText?: string

  /** 初始手机号，默认为空，需用户手动输入 */
  mobile?: string
  /** 点击确认 resolve 后关闭弹窗 */
  onConfirm: (payload: { mobile: string; smsId: string; code: string }) => Promise<void>
  onCancel?: () => void
}) => {
  const stepRef = ref(0)
  const STEP_MOBILE = 0
  const STEP_CODE = 1

  const {
    title = '校验手机号',
    subtitle = '将通过短信发送验证码到您的手机上',
    confirmButtonText = '确定',
    cancelButtonText = '取消'
  } = options

  const phoneRef = ref('')
  const codeRef = ref('')
  let lastSendCodePhone = ''
  /** 验证码id */
  const smsId = ref('')

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
    // 手机号不变，且在倒计时中，直接跳入验证码页，在里面显示重新获取倒计时
    if (countdownRef.value > 0 && phoneRef.value === lastSendCodePhone) {
      stepRef.value = STEP_CODE
      return void 0
    }
    if (!test.mobile(phoneRef.value)) {
      useToast('请输入正确的手机号')
      return
    }
    sendMessageCode(phoneRef.value)
      .then(res => {
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
        useToast(err.response?.data?.msg || err.message || '验证码发送失败，请重试')
      })
      .finally(useLoadingEnd)
  }

  const onConfirm = () => {
    if (!test.mobile(phoneRef.value)) {
      useToast('请输入正确的手机号')
      return void 0
    }
    if (!test.code(codeRef.value)) {
      useToast('请输入6位数字验证码')
      return void 0
    }

    options
      .onConfirm({
        code: codeRef.value,
        mobile: phoneRef.value,
        smsId: smsId.value
      })
      .then(() => {
        modal.close()
      })
  }

  const onCancel = () => {
    modal.close()
    options.onCancel?.()
  }

  const modal = useModal({
    title: '绑定手机号',
    closeable: false,
    maskCloseable: false,
    content: () => {
      return (
        <div class="use-mobile-verify">
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
            <div class="c_quick-login__title">{title}</div>
            <div class="c_quick-login__subtitle">{subtitle}</div>
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
            <div class="use-mobile-verify__cancel" onClick={onCancel}>
              {cancelButtonText}
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
                <VerifyCode
                  count={6}
                  value={codeRef.value}
                  onChange={value => {
                    codeRef.value = value
                  }}
                />
              )}
            </div>
            {/* <div>{codeRef.value}</div> */}
            <div class="c_quick-login__button" onClick={onConfirm}>
              {confirmButtonText}
            </div>
          </div>
        </div>
      )
    }
  })
}
