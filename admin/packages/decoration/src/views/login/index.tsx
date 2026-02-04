import { defineComponent, reactive } from 'vue'
import { Button, Input, message } from '@pkg/ui'
import './style.scss'
import logo from '../assets/logo.svg'
import wechat from '../assets/wechat.svg'
import MagnetMatrix from './magnet-matrix'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'LegoLoginPage',
  setup() {
    const router = useRouter()

    const state = reactive({
      type: 'pwd',
      mobile: '',
      code: '',
      account: 'admin',
      password: 'admin',
      qrcode: '',
      countDown: 30,
      proclaimed: false,
      loading: false
    })

    const onLoginSuccess = () => {
      message.success('欢迎回来，管理员 👏🏻')
      router.replace('/')
    }

    const handleLogin = () => {
      if (state.type === 'pwd') {
        state.loading = true
        setTimeout(() => {
          state.loading = false
          onLoginSuccess()
        }, 1000)
      }
    }

    const WechatQRCode = () => {
      return (
        <>
          <div class="main-title">微信安全登录</div>
          <div class="qr-code">
            <img src="https://pixso.cn/user/login/assets/wechat-qr.d4b88757.png" alt="" />
            <div class="qr-code__refresh clickable">
              <span>二维码已失效</span>
              <span>点击刷新</span>
            </div>
          </div>
          <div class="wechat-protocol">
            请关注公众号，登录代表同意{' '}
            <a class="clickable" href="#">
              隐私政策
            </a>
          </div>
          <div class="toggle-type clickable" onClick={() => (state.type = 'sms')}>
            手机短信登录
          </div>
        </>
      )
    }

    const Sms = () => {
      return (
        <>
          <div class="main-title">手机短信登录</div>
          <Button class="toggle-wechat" onClick={() => (state.type = 'qrcode')}>
            <img src={wechat} alt="" />
            微信登录
          </Button>
          <div class="divider">或</div>
          <Input
            class="ipt"
            placeholder="请输入手机号"
            value={state.mobile}
            onChange={(e) => (state.mobile = e.target.value as string)}
          ></Input>
          <Input
            class="ipt"
            placeholder="请输入验证码"
            value={state.code}
            onChange={(e) => (state.code = e.target.value as string)}
            suffix={<div class="sm-btn clickable">发送</div>}
          ></Input>
          <Button class="primary-btn" type="primary">
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
          <Button class="toggle-wechat" onClick={() => (state.type = 'qrcode')}>
            <img src={wechat} alt="" />
            微信登录
          </Button>
          <div class="divider">或</div>
          <Input
            class="ipt"
            placeholder="请输入手机号/账号"
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
                  <iconpark-icon name="preview-open-96aof6dl"></iconpark-icon>
                </div>
              }
            ></Input>
          ) : (
            <Input
              class="ipt"
              type="password"
              placeholder="请输入密码"
              value={state.password}
              onChange={(e) => (state.password = e.target.value as string)}
              suffix={
                <div class="suffix-icon" onClick={() => (state.proclaimed = true)}>
                  <iconpark-icon name="preview-close"></iconpark-icon>
                </div>
              }
            ></Input>
          )}

          <Button class="primary-btn" type="primary" loading={state.loading} onClick={handleLogin}>
            登录
          </Button>
          <div class="toggle-type clickable" onClick={() => (state.type = 'sms')}>
            手机短信登录
          </div>
        </>
      )
    }

    return () => {
      return (
        <div class="login-page">
          <div class="logo">
            <img src={logo} alt="" />
          </div>
          <MagnetMatrix />
          <div class="login-box">
            {state.type === 'qrcode' ? <WechatQRCode /> : state.type === 'pwd' ? <Pwd /> : <Sms />}
          </div>
        </div>
      )
    }
  }
})
