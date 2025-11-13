import { computed, defineComponent, onBeforeUnmount, ref } from 'vue'
import './style.scss'
import Code from './code'
import { Icon, Input, message } from '@anteng/ui'

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
    userAgreement: {
      type: Object
    }
  },
  emits: {
    cancel: () => true
  },
  setup(props, { emit, slots }) {
    /** 关闭页面/弹窗 */
    const cancel = () => {
      emit('cancel')
    }

    /** 当前步骤 */
    const stepRef = ref(STEP_INDEX)

    /** 是否为绑定手机号步骤 */
    const isBind = ref(false)

    /** 手机号，默认为上次登录的 */
    const phoneRef = ref('13800000000')

    /** 验证码 */
    const codeRef = ref('')

    /** 验证码id */
    const smsId = ref('')

    /** 勾选用户协议 */
    const hasAgreed = ref(true)
    const toggleAgree = () => {
      hasAgreed.value = !hasAgreed.value
    }
    const checkAgree = () => {
      if (!hasAgreed.value) {
        message.info('请先同意相关协议')
      }
      return hasAgreed.value
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
      clearTimeout(countdownTimer as any)
    })

    const fetchCode = () => {
      message.success('验证码已发送（仅模拟）')
      stepRef.value = STEP_CODE
    }

    const smsLogin = () => {
      message.success('登录成功（仅模拟）')
      cancel()
    }

    const userAgreement = computed(() => {
      const v = props.userAgreement || {
        type: 4,
        title: '《用户服务协议》',
        content: '',
        link: ''
      }
      return {
        ...v,
        title:
          v.type === 1 ? (
            <span class="color-disabled">{`{{ 同步用户协议页面标题 }}`}</span>
          ) : v.type === 4 ? (
            '《用户服务协议》'
          ) : (
            v.title
          )
      }
    })

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

            <div class="c_quick-login__button">
              一键登录
              {!hasAgreed.value && (
                <div class="c_quick-login__button-agree" onClick={checkAgree}></div>
              )}
            </div>

            <div class="c_quick-login__user-agreement">
              <div class={['checkbox', hasAgreed.value && 'active']} onClick={toggleAgree}>
                <iconpark-icon name="check-small"></iconpark-icon>
              </div>
              <span class="label" onClick={toggleAgree}>
                我已阅读并同意
              </span>
              <span class="link">{userAgreement.value.title}</span>
            </div>
            <div
              class="c_quick-login__mobile"
              onClick={() => {
                if (!checkAgree()) return void 0
                stepRef.value = STEP_MOBILE
              }}
            >
              <iconpark-icon name="iphone"></iconpark-icon>
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
          >
            <div
              class="c_quick-login__subpage-nav p_login-close"
              onClick={() => {
                stepRef.value = STEP_INDEX
              }}
            >
              <iconpark-icon name="left"></iconpark-icon>
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
                  placeholder="请输入手机号码"
                  maxlength={11}
                  value={phoneRef.value}
                />
              }
              {phoneRef.value.length > 0 && (
                <div
                  class="clear"
                  onClick={() => {
                    phoneRef.value = ''
                  }}
                >
                  <Icon name="close"/>
                </div>
              )}
            </div>
            <div class="c_quick-login__button" onClick={fetchCode}>
              获取验证码
            </div>
          </div>

          {/* 输入验证码 */}
          <div class={['c_quick-login__subpage', stepRef.value >= STEP_CODE && 'active']}>
            <div
              class="c_quick-login__subpage-nav p_login-close"
              onClick={() => {
                stepRef.value = STEP_MOBILE
              }}
            >
              <iconpark-icon name="left"></iconpark-icon>
            </div>
            <div class="c_quick-login__title">请输入验证码</div>
            <div class="c_quick-login__subtitle number-font">
              已将验证码发送至138****0000，
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
                  onChange={(value) => {
                    codeRef.value = value
                  }}
                />
              )}
            </div>
            <div class="c_quick-login__button" onClick={smsLogin}>
              {isBind.value ? '立即绑定' : '立即登录'}
            </div>
          </div>
        </>
      )
    }
  }
})
