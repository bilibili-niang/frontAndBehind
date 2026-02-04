import { defineComponent, PropType } from 'vue'
import './style.scss'
import { DeckComponent } from '../../../stores/canvas'
import SubTitle from '../sub-title/render'
import { useAction } from '@pkg/core'

export { default as manifest } from './manifest'

export default defineComponent({
  props: {
    comp: {
      type: Object as PropType<DeckComponent<{}>>,
      required: true
    },
    config: {
      type: Object as PropType<{}>,
      required: true
    }
  },
  setup(props) {
    const cfg = props.config as any

    const TopBar = () => {
      const tb = cfg?.topBar || {}
      if (tb?.show === false) return null
      const greeting = tb?.greeting || '晚上好'
      const unLoginText = tb?.unLoginText || '登录/注册'
      const leftText = greeting
      const loggedIn = false
      const voucherCount = typeof tb?.voucherCount === 'number' ? tb?.voucherCount : 0
      const couponCount = typeof tb?.couponCount === 'number' ? tb?.couponCount : 0
      return (
        <div class="jump-topbar" style={{ background: tb?.background || '#2c2c2c' }}>
          {tb?.avatar && <img class="avatar" src={tb.avatar} alt=""/>}
          <div class="info">
            <span class="greet">{leftText}</span>
          </div>
          {loggedIn ? (
            <div class="stat">
              <span>代金券：{voucherCount}</span>
              <span class="divider">·</span>
              <span>优惠券：{couponCount}</span>
            </div>
          ) : (
            <div class="unlogin-text">{unLoginText}</div>
          )}
        </div>
      )
    }

    const Left = () => {
      const left = cfg?.leftContent || {}
      const leftBg = typeof left?.leftImage === 'string' ? left.leftImage : left?.leftImage?.url
      const titleConfig = left?.titleConfig
        ? left.titleConfig
        : {
            title: { text: '到店自取' },
            subtitle: { text: 'PICK UP', placement: 'bottom' }
          }
      return (
        <div class={["opt", "--left", 'clickable']} style={{ backgroundImage: leftBg ? `url(${leftBg})` : undefined }} onClick={() => useAction(left.action)}>
          <SubTitle comp={{} as any} config={titleConfig} />
        </div>
      )
    }

    const Right = () => {
      const rcfg = cfg?.rightContent || {}
      const rImgRaw = rcfg?.rightImage
      const rBg = typeof rImgRaw === 'string' ? rImgRaw : rImgRaw?.url
      const titleConfig = rcfg?.titleConfig
        ? rcfg.titleConfig
        : {
            title: { text: '外卖配送' },
            subtitle: { text: 'DELIVERY', placement: 'bottom' }
          }
      return (
        <div class={["opt", "--right", 'clickable']} style={{ backgroundImage: rBg ? `url(${rBg})` : undefined }} onClick={() => useAction(rcfg.action)}>
          <SubTitle comp={{} as any} config={titleConfig} />
        </div>
      )
    }

    return () => {
      return (
        <div class="c_jump-card">
          <TopBar/>
          <div class="jump-card-body" style={{ background: cfg?.cardStyle?.background || '#fff' }}>
            <Left/>
            <div class="split-line"/>
            <Right/>
          </div>
        </div>
      )
    }
  }
})
