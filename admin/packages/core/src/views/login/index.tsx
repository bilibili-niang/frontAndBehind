import { computed, defineComponent, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { Button, Empty, Icon, Input, message, Spin, Radio } from '@anteng/ui'
import './style.scss'
import { useRouter } from 'vue-router'
import md5 from 'blueimp-md5'
import {
  authMerchantDirect,
  authMessageCode,
  authMessageCodeThenChooseMerchant,
  type IAuthMerchant,
  loginByAccountAndPassword,
  resetPasswordRequest,
  sendMessageCode
} from '../../api/login'
import { useRequestErrorMessage } from '../../hooks/useRequestErrorMessage'
import test from '../../utils/test'
import useAppStore from '../../stores/app'
import useUserStore from '../../stores/user'
import { isDev } from '@anteng/utils'
import { LOGIN_IDENTITY } from '@anteng/config'
import MagnetMatrix from './magnet-matrix'

export default defineComponent({
  name: 'LegoLoginPage',
  setup() {
    const router = useRouter()
    const appStore = useAppStore()

    const userStore = useUserStore()

    const scope = computed(() => {
      return appStore.scope ?? localStorage.getItem('scope') ?? 'cs'
    })

    watch(
      () => userStore.userInfo,
      (v) => {
        if (userStore.userInfo?.id) {
          try {
            onLoginSuccess()
          } catch (e) {
            console.log(e)
          }
        }
      },
      { immediate: true }
    )
    const state = reactive({
      type: 'pwd',
      mobile: localStorage.getItem('Last-Login-Mobile') || '',
      code: '',
      smsId: '',
      account: '',
      password: '',
      newPassword: '',
      qrcode: '',
      countDown: 30,
      proclaimed: false,
      loading: false,
      smsLoading: false,
      loginMethod: 'account' // 登录方式: 'account' | 'userName' | 'phoneNumber'
    })

    const countdownRef = ref(0)
    let countdownTimer: NodeJS.Timeout

    const countdown = () => {
      countdownRef.value--
      if (countdownRef.value > 0) {
        countdownTimer = setTimeout(countdown, 1000)
      }
    }

    onBeforeUnmount(() => {
      clearTimeout(countdownTimer)
    })

    const onLoginSuccess = () => {
      router.replace('/')
    }

    // 调试：确认背景和容器挂载状态
    onMounted(() => {
      document.querySelector('.login-page')
              .addEventListener('pointermove', (e) => {
                const { currentTarget: el, clientX: x, clientY: y } = e
                const { top: t, left: l, width: w, height: h } = el.getBoundingClientRect()
                el.style.setProperty('--posX', x - l - w / 2)
                el.style.setProperty('--posY', y - t - h / 2)
              })
    })

    const handleLogin = () => {
      // 没有输入账号和手机号,则判断是不是测试环境,因为目前测试环境没有接口的
      if (!state.account && !state.mobile) {
        const ok = isDev(() => {

          console.log('执行了action')

          // 直接写入用户信息，触发登录后的流程（仅测试/开发环境）
          userStore.userInfo = {
            account: 'tester',
            avatar: null,
            id: 'U-DEV-10086',
            name: '测试用户',
            merchantName: '示例商户',
            phone: '13800000000',
            realName: '测式',
            status: 1,
            merchantId: 1001
          } as any
          localStorage.setItem(LOGIN_IDENTITY, 'dev-token')

          message.success('测试环境登录成功')
          router.replace('/home')

          return true
        })
        if (ok === true) {
          return void 0
        }
        return void 0
      }

      // STEP 密码登录
      if (state.type === 'pwd') {
        const { account, password, loginMethod } = state
        if (!account || !password) {
          return message.error('请输入账号和密码')
        }
        const loading = message.loading('登录中...')

        // 根据选择的登录方式构建请求参数
        const loginData: any = {
          password: md5(password),
          // 根据选择的登录方式添加相应字段
          ...(loginMethod === 'account' ? { account } :
            loginMethod === 'userName' ? { userName: account } :
              loginMethod === 'phoneNumber' ? { phoneNumber: account } : {})
        }

        loginByAccountAndPassword(loginData)
          .then((re) => {
            if (re.success) {
              const d: any = re.data
              // 新后端：直接返回登录 token / 用户信息，直接跳首页
              if (d && (d.token || (d.access_token && d.token_type))) {
                const payload = d.token
                  ? { token_type: d.token_type || 'Bearer', access_token: d.token, userInfo: d.userInfo }
                  : d
                onAuthResolve(payload)
                return
              }
              // 旧流程：需要选择商户
              merchantList.value = Array.isArray(d) ? d : []
              state.type = 'merchant'
              // 只有一个商户，自动触发选择
              if (merchantList.value.length === 1) {
                onMerchantChoose(0)
              }
            } else {
              useRequestErrorMessage(re)
            }
          })
          .catch((e) => {
            useRequestErrorMessage(e)
          })
          .finally(loading)

        // STEP 重置密码
      } else if (state.type === 'resetPassword') {
        if (!test.mobile(state.account)) {
          return message.error('请输入11位数手机号码')
        }
        if (!test.code(state.code)) {
          return message.error('请输入6位数验证码')
        }
        if (!state.newPassword) {
          return message.error('请输入新密码')
        }
        // 请求
        state.loading = true
        resetPasswordRequest({
          mobile: state.account,
          smsId: state.smsId,
          code: state.code,
          newPassword: md5(state.newPassword)
        })
          .then((res: any) => {
            if (res.success) {
              message.success(res.msg)
              state.loading = false
              state.type = 'pwd'
            } else {
              message.error(res.msg)
              state.loading = false
            }
          })
          .catch((e) => {
            state.loading = false
            useRequestErrorMessage(e)
          })
      } else if (state.type === 'sms') {
        if (!test.mobile(state.mobile)) {
          return message.error('请输入11位数手机号码')
        }
        if (!test.code(state.code)) {
          return message.error('请输入6位数验证码')
        }
        state.loading = true

        if (scope.value === 'su') {
          return authMessageCode({
            scope: scope.value,
            phone: state.mobile,
            smsId: state.smsId,
            code: state.code
          })
            .then(onAuthResolve)
            .catch((err) => {
              message.error(err.response.data.error_description)
            })
            .finally(() => {
              state.loading = false
              state.code = ''
              state.smsId = ''
            })
        }

        authMessageCodeThenChooseMerchant({
          scope: scope.value,
          phone: state.mobile,
          smsId: state.smsId,
          code: state.code
        })
          .then((res: any) => {
            merchantList.value = Array.isArray(res.data) ? res.data : []
            state.type = 'merchant'

            // 只有一个商户，自动触发选择
            if (merchantList.value.length === 1) {
              onMerchantChoose(0)
            }
          })
          .catch((err) => {
            message.error(err.response.data.error_description)
          })
          .finally(() => {
            state.loading = false
            state.code = ''
            state.smsId = ''
          })
      }
    }

    const onAuthResolve = (res: any) => {
      const token = res?.access_token
        ? `${res.token_type} ${res.access_token}`
        : res?.token
          ? `${res.token_type || 'Bearer'} ${res.token}`
          : ''
      if (token) {
        localStorage.setItem(LOGIN_IDENTITY, token)
      }
      localStorage.setItem('Last-Login-Mobile', state.mobile)
      countdownRef.value = 0
      clearTimeout(countdownTimer)
      message.success('登录成功')
      const us = useUserStore()
      if (res?.userInfo) {
        // 如果后端已返回用户信息，则直接写入，避免额外请求
        ;(us as any).userInfo = res.userInfo
      } else {
        us.getUserInfo().then(() => {
        })
      }
      onLoginSuccess()
    }

    const sms = () => {
      if (state.smsLoading || countdownRef.value > 0) {
        return false
      }
      state.smsLoading = true
      sendMessageCode(state.type === 'resetPassword' ? state.account : state.mobile)
        .then((res: any) => {
          if (res.code !== 200) {
            throw new Error(res.msg || res.data.msg)
          }
          message.success(res.msg || res.data.msg || '验证码发送成功，请留意短信')
          state.smsId = res.data.id
          countdownRef.value = 60
          countdown()
        })
        .catch((err) => {
          console.log(err)
          useRequestErrorMessage(err)
        })
        .finally(() => {
          state.smsLoading = false
        })
    }

    const Sms = () => {
      return (
        <>
          <div class="main-title">手机短信登录</div>
          <Input
            class="ipt"
            maxlength={11}
            placeholder="请输入手机号"
            value={state.mobile}
            onChange={(e) => (state.mobile = e.target.value as string)}
          ></Input>
          <Input
            class="ipt"
            placeholder="请输入验证码"
            maxlength={6}
            value={state.code}
            onChange={(e) => (state.code = e.target.value as string)}
            suffix={
              <div class={['sms-btn clickable', countdownRef.value > 0 && '--disabled']} onClick={sms}>
                {countdownRef.value > 0 ? `${countdownRef.value}s` : state.smsLoading ? <Spin/> : '发送'}
              </div>
            }
          ></Input>
          <Button class="primary-btn" type="primary" loading={state.loading} onClick={handleLogin}>
            登录
          </Button>
          <div class="toggle-type clickable" onClick={() => (state.type = 'pwd')}>
            密码登录
          </div>
        </>
      )
    }

    const Pwd = () => {
      return (
        <>
          <div class="main-title">账号密码登录</div>

          {/* 登录方式选择 */}
          <div class="login-method-selector">
            <Radio.Group
              value={state.loginMethod}
              onChange={(e: any) => (state.loginMethod = e.target.value)}
            >
              <Radio value="account">手机号+密码</Radio>
              <Radio value="userName">用户名+密码</Radio>
              <Radio value="phoneNumber" disabled>手机号</Radio>
            </Radio.Group>
          </div>

          <Input
            class="ipt"
            placeholder={state.loginMethod === 'phoneNumber' ? '请输入手机号' :
              state.loginMethod === 'userName' ? '请输入用户名' :
                '请输入手机号/用户名'}
            value={state.account}
            onChange={(e) => (state.account = e.target.value as string)}
          ></Input>
          {state.proclaimed ? (
            <Input
              class="ipt"
              placeholder="请输入密码"
              value={state.password}
              onChange={(e) => (state.password = e.target.value as string)}
              suffix={
                <div class="suffix-icon" onClick={() => (state.proclaimed = false)}>
                  <Icon name="preview"></Icon>
                </div>
              }
            ></Input>
          ) : (
            <div class="ipt-wrap">
              <Input
                class="ipt"
                type="password"
                placeholder="请输入密码"
                value={state.password}
                onChange={(e) => (state.password = e.target.value as string)}
                suffix={
                  <div class="suffix-icon" onClick={() => (state.proclaimed = true)}>
                    <Icon name="preview-close"></Icon>
                  </div>
                }
              ></Input>
            </div>
          )}

          <Button class="primary-btn" type="primary" loading={state.loading} onClick={handleLogin}>
            登录
          </Button>
          <div class="login-page-bottom-limit">
            <a onClick={() => (state.type = 'resetPassword')}>忘记密码</a>
          </div>
        </>
      )
    }

    const isMerchantAuthLoading = ref(false)

    const onMerchantChoose = (index: number) => {
      const target = merchantList.value[index]
      isMerchantAuthLoading.value = true
      authMerchantDirect({
        token: target.directToken,
        scope: scope.value
      })
        .then(onAuthResolve)
        .catch((err) => {
          message.error(err.response.data.error_description)
        })
        .finally(() => {
          isMerchantAuthLoading.value = false
        })
    }

    const merchantList = ref<IAuthMerchant[]>([])

    const MerchantChoose = () => {
      return (
        <div class="login-merchant">
          <Spin spinning={isMerchantAuthLoading.value}>
            <div class="login-merchant__title">
              请选择商户账号
              <a
                style="font-size:12px;margin-left:auto;"
                onClick={() => {
                  state.type = 'sms'
                }}
              >
                重新登录
                <Icon name="right"/>
              </a>
            </div>
            <div class="login-merchant__list ui-scrollbar">
              {merchantList.value.length === 0 && <Empty style="margin-top:48px;" description="无可登录的商户账号"/>}
              {merchantList.value.map((item, index) => {
                return (
                  <div
                    class="login-merchant__item clickable"
                    onClick={() => {
                      onMerchantChoose(index)
                    }}
                  >
                    <div class="login-merchant__avatar" style={{ backgroundImage: `url(${item.logoImgUri})` }}></div>
                    <div class="login-merchant__info">
                      <div class="login-merchant__name">{item.name}</div>
                      <div class="login-merchant__company">{item.companyName}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Spin>
        </div>
      )
    }

    const ResetPassword = () => {
      return (
        <>
          <div class="main-title">忘记密码</div>
          <Input
            class="ipt"
            placeholder="请输入手机号"
            value={state.account}
            onChange={(e) => (state.account = e.target.value as string)}
          ></Input>
          <Input
            class="ipt"
            placeholder="请输入验证码"
            maxlength={6}
            value={state.code}
            onChange={(e) => (state.code = e.target.value as string)}
            suffix={
              <div class={['sms-btn clickable', countdownRef.value > 0 && '--disabled']} onClick={sms}>
                {countdownRef.value > 0 ? `${countdownRef.value}s` : state.smsLoading ? <Spin/> : '发送'}
              </div>
            }
          ></Input>
          <Input
            class="ipt"
            type="password"
            placeholder="请输入新密码"
            value={state.newPassword}
            onChange={(e) => (state.newPassword = e.target.value as string)}
            suffix={
              <div class="suffix-icon" onClick={() => (state.proclaimed = true)}>
                <Icon name="preview-close"></Icon>
              </div>
            }
          ></Input>
          <Button class="primary-btn" type="primary" loading={state.loading} onClick={handleLogin}>
            重置密码
          </Button>
          <div class="toggle-type clickable" onClick={() => (state.type = 'pwd')}>
            返回
          </div>
        </>
      )
    }

    const loginBoxRef = ref<HTMLElement | null>(null)

    const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)
    const glowX = ref(0.5)
    const glowY = ref(0.5)

    const onGlowMove = (e: MouseEvent) => {
      const el = loginBoxRef.value
      if (!el) return
      const rect = el.getBoundingClientRect()
      const nx = (e.clientX - rect.left) / rect.width
      const ny = (e.clientY - rect.top) / rect.height

      // 计算与当前光晕中心的距离与方向
      const dx = nx - glowX.value
      const dy = ny - glowY.value
      const dist = Math.hypot(dx, dy) // 0 ~ √2

      // 避让阈值与强度（可按需微调）
      const threshold = 0.25 // 接近时触发避让（相对容器尺寸）
      const strength = 0.35 // 推远强度

      if (dist < threshold) {
        // 距离越近，推开越强，方向为远离鼠标
        const inv = 1 / (dist + 1e-4)
        const push = (threshold - dist) * strength * inv
        glowX.value = clamp(glowX.value - dx * push, 0.05, 0.95)
        glowY.value = clamp(glowY.value - dy * push, 0.05, 0.95)
      } else {
        // 不靠近时，缓慢向鼠标方向漂移，避免突兀
        glowX.value = clamp(glowX.value + (nx - glowX.value) * 0.03, 0.05, 0.95)
        glowY.value = clamp(glowY.value + (ny - glowY.value) * 0.03, 0.05, 0.95)
      }

      // 边缘靠近时增强发光强度（维持原逻辑）
      const edgeDist = Math.min(glowX.value, 1 - glowX.value, glowY.value, 1 - glowY.value)
      const proximityEdge = Math.max(0, 1 - edgeDist * 2)
      const baseGlow = 0.35
      const proximity = Math.min(1, baseGlow + proximityEdge * 0.65)

      el.style.setProperty('--mx', glowX.value * 100 + '%')
      el.style.setProperty('--my', glowY.value * 100 + '%')
      el.style.setProperty('--glow', proximity.toFixed(3))

      // 调试输出（节流简单处理）
      ;(window as any).__glowLogTs = (window as any).__glowLogTs || 0
      const now = Date.now()
      if (now - (window as any).__glowLogTs > 200) {
        (window as any).__glowLogTs = now
      }
    }

    const onGlowEnter = () => {
      const el = loginBoxRef.value
      if (el) {
        el.style.setProperty('--glow', '0.65')
      }
      console.log('[login glow] enter')
    }

    const onGlowLeave = () => {
      return void 0
      const el = loginBoxRef.value
      if (!el) return
      // 回到中心并关闭发光
      glowX.value = 0.5
      glowY.value = 0.5
      el.style.setProperty('--mx', '50%')
      el.style.setProperty('--my', '50%')
      el.style.setProperty('--glow', '0')
    }

    return () => {
      return (
        <div class="login-page">
          {/* 背景模糊色块（缓慢流动） */}
          <div class="color-blobs" aria-hidden="true">
            <div class="blob blob--blue"></div>
            <div class="blob blob--pink"></div>
            <div class="blob blob--teal"></div>
          </div>
          <MagnetMatrix/>
          <div class="frosted-film"></div>
          {/* @ts-ignore */}
          <div class="login-box" theme="light" ref={loginBoxRef} onMouseenter={onGlowEnter} onMousemove={onGlowMove}
               onMouseleave={onGlowLeave}>
            {state.type === 'resetPassword' ? (
              <ResetPassword/>
            ) : state.type === 'merchant' ? (
              <MerchantChoose/>
            ) : state.type === 'pwd' ? (
              <Pwd/>
            ) : (
              <Sms/>
            )}
          </div>
        </div>
      )
    }
  }
})