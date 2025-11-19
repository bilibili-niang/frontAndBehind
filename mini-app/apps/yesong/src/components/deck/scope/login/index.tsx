import { PropType, ref, defineComponent, onBeforeUnmount } from 'vue'
import { DeckComponentConfig } from '../../types'
import './style.scss'
import { Input } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { emitter, useUserStore } from '@anteng/core'
import { Icon } from '@anteng/ui'
import { sendMessageCode } from '@anteng/core/src/api'
import { test } from '@anteng/utils'
import { useToast } from '@anteng/core'
import { authMessageCode } from '@anteng/core/src/api'

function buildUrl(url, query) {
  const queryString = new URLSearchParams(query).toString()
  return queryString ? `${url}?${queryString}` : url
}

type LoginComp = {}

export default defineComponent({
  name: 'C_Login',
  props: {
    config: {
      type: Object as PropType<DeckComponentConfig<LoginComp>>,
      required: true
    },
    reload: {
      type: Boolean,
      default: true
    }
  },
  setup(props, { emit }) {
    /** 关闭页面/弹窗 */
    const cancel = () => {
      emit('cancel')
      emitter.trigger('LOGIN_CLOSE')
    }

    /** 手机号，默认为上次登录的 */
    const phoneRef = ref(Taro.getStorageSync('last-login-mobile') || '')

    /** 验证码 */
    const codeRef = ref('')

    /** 验证码id */
    const smsId = ref('')

    /** 勾选用户协议 */
    const hasAgreed = ref(false)

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

    // 卸载时清除倒计时计时器
    onBeforeUnmount(() => {
      clearTimeout(countdownTimer)
    })

    const fetchCode = () => {
      if (!test.mobile(phoneRef.value)) {
        useToast('请输入正确的手机号')
        return
      }
      Taro.showLoading()
      sendMessageCode(phoneRef.value)
        .then(res => {
          Taro.hideLoading()
          useToast(res.msg || '短信验证已发送')
          smsId.value = res.data.id
          countdownRef.value = 60
          countdown()
        })
        .catch(err => {
          Taro.hideLoading()
          useToast(err.response?.data?.msg || err.message || '验证码发送失败，请重试')
        })
    }

    const confirm = () => {
      if (!test.mobile(phoneRef.value)) {
        useToast('请输入正确的手机号')
        return
      }
      if (!test.code(codeRef.value)) {
        useToast('请输入6位数字验证码')
        return
      }
      if (!hasAgreed.value) {
        useToast('请先同意相关协议')
        return
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
            .then(userInfo => {
              Taro.hideLoading()
              useToast('登录成功')
              countdownRef.value = 0
              clearTimeout(countdownTimer)
              emit('success', userInfo)
              Taro.setStorageSync('last-login-mobile', phoneRef.value)
              if (props.reload) {
                // 重载此页面
                const router = useRouter()
                Taro.redirectTo({
                  url: buildUrl(router.path, router.params)
                })
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

    return () => {
      return (
        <div class="c_login" style={`--theme-color:${props.config.themeColor}`}>
          <div class="c_login__mobile">
            <Input
              class="c_login__input"
              placeholderClass="c_login__input-placeholder"
              type="number"
              clueType={1}
              placeholder="请输入手机号"
              maxlength={11}
              value={phoneRef.value}
              cursorSpacing={124}
              onInput={e => {
                phoneRef.value = e.detail.value.trim()
              }}
            />
          </div>
          <div class="c_login__code">
            <Input
              class="c_login__input"
              placeholderClass="c_login__input-placeholder"
              placeholder="请输入验证码"
              type="number"
              maxlength={6}
              value={codeRef.value}
              cursorSpacing={124}
              onInput={e => {
                codeRef.value = e.detail.value.trim()
              }}
            />
            {countdownRef.value > 0 ? (
              <div class="c_login__sms disabled">{countdownRef.value}s</div>
            ) : (
              <div class="c_login__sms" onClick={fetchCode}>
                获取验证码
              </div>
            )}
          </div>
          <div class="c_login__confirm" onClick={confirm}>
            登录
          </div>
          <div class="c_login__user-agreement" onClick={() => (hasAgreed.value = !hasAgreed.value)}>
            <div class={['checkbox', hasAgreed.value && 'active']}>
              <Icon name="check" />
            </div>
            <span>我已阅读并同意</span>
            <span class="c_login__link">《用户服务协议》</span>
          </div>
          <div class="c_login__skip" onClick={cancel}>
            暂不登录，先去逛逛
          </div>
        </div>
      )
    }
  }
})
