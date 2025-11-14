import { defineComponent } from 'vue'
import './style.scss'
import { useAction } from '../../hooks/useAction'

/** 跳转卡片（通用装修组件）
 * 前台最小实现，支持顶部栏、左右卡片、标题/副标题与点击事件
 */
export default defineComponent({
  name: 'c_jump-card',
  props: {
    config: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const cfg = props.config as any

    const SubTitle = (titleConfig?: any) => {
      const tc = titleConfig || {}
      const title = tc.title || {}
      const sub = tc.subtitle || {}
      const showSub = sub?.enable ?? true
      const placement = sub?.placement || 'bottom'
      const align = tc.align || cfg?.align || 'center'

      const TitleSpan = (
        <span class="st-title" style={{ color: title?.color || '#1f1f1f', fontSize: typeof title?.fontSize === 'number' ? `${title.fontSize}px` : title?.fontSize || '18px' }}>
          {title?.text || '主标题'}
        </span>
      )
      const SubSpan = showSub ? (
        <span class="st-subtitle" style={{ color: sub?.color || '#999999', fontSize: typeof sub?.fontSize === 'number' ? `${sub.fontSize}px` : sub?.fontSize || '12px' }}>
          {sub?.text || '副标题'}
        </span>
      ) : null

      if (placement === 'left') {
        return <div class={['c_sub-title', '--row', '--left', `align-${align}`].join(' ')}>{SubSpan}{TitleSpan}</div>
      }
      if (placement === 'right') {
        return <div class={['c_sub-title', '--row', '--right', `align-${align}`].join(' ')}>{TitleSpan}{SubSpan}</div>
      }
      if (placement === 'top') {
        return <div class={['c_sub-title', '--col', '--top', `align-${align}`].join(' ')}>{SubSpan}{TitleSpan}</div>
      }
      return <div class={['c_sub-title', '--col', '--bottom', `align-${align}`].join(' ')}>{TitleSpan}{SubSpan}</div>
      }

    const TopBar = () => {
      const tb = cfg?.topBar || {}
      if (tb?.show === false) return null
      const greeting = tb?.greeting || '晚上好'
      const unLoginText = tb?.unLoginText || '登录/注册'
      return (
        <div class="jump-topbar" style={{ background: tb?.background || '#2c2c2c' }}>
          <div class="info"><span class="greet">{greeting}</span></div>
          <div class="unlogin-text">{unLoginText}</div>
        </div>
      )
    }

    const Left = () => {
      const left = cfg?.leftContent || {}
      const leftBg = typeof left?.leftImage === 'string' ? left.leftImage : left?.leftImage?.url
      const titleConfig = left?.titleConfig || {
        title: { text: '到店自取' },
        subtitle: { text: 'PICK UP', placement: 'bottom' }
      }
      return (
        <div class={["opt", "--left", 'clickable'].join(' ')} style={{ backgroundImage: leftBg ? `url(${leftBg})` : undefined }} onClick={() => useAction(left.action)}>
          {SubTitle(titleConfig)}
        </div>
      )
    }

    const Right = () => {
      const rcfg = cfg?.rightContent || {}
      const rImgRaw = rcfg?.rightImage
      const rBg = typeof rImgRaw === 'string' ? rImgRaw : rImgRaw?.url
      const titleConfig = rcfg?.titleConfig || {
        title: { text: '外卖配送' },
        subtitle: { text: 'DELIVERY', placement: 'bottom' }
      }
      return (
        <div class={["opt", "--right", 'clickable'].join(' ')} style={{ backgroundImage: rBg ? `url(${rBg})` : undefined }} onClick={() => useAction(rcfg.action)}>
          {SubTitle(titleConfig)}
        </div>
      )
    }

    return () => (
      <div class="c_jump-card">
        <TopBar />
        <div class="jump-card-body" style={{ background: cfg?.cardStyle?.background || '#ffffff' }}>
          <Left />
          <div class="split-line" />
          <Right />
        </div>
      </div>
    )
  }
})