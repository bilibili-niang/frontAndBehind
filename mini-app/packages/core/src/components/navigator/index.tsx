import { PropType, computed, defineComponent, ref, watch } from 'vue'
import './style.scss'
import { useAppStore } from '../../stores'
import { storeToRefs } from 'pinia'
import Taro from '@tarojs/taro'
import { Icon } from '@pkg/ui'
import useQuickMenu, { QuickMenuOptions } from '../../hooks/useQuickMenu'
import { navigateBack } from '../../utils/router'
import { calcTransitionColor } from '@pkg/utils'

export type NavigatorOptions = {
  navigatorStyle?: 'common' | 'blank' | 'immersive'
  /** 标题 */
  title?: any
  /** 标题是否居中 */
  titleCentered?: boolean
  /** 标题：固定 */
  fixedTitle?: any
  /** 沉浸式，导航栏将变成透明的，且高度塌陷 */
  immersive?: boolean
  /** 隐藏快捷菜单按钮，不会隐藏返回按钮，如果需要完全自定义请使用 navigatorStyle：blank */
  showMenuButton?: boolean
  /** 状态栏颜色 */
  navigationBarTextStyle?: 'white' | 'black'
  /** 状态栏颜色：固定 */
  navigationBarTextStyleFixed?: 'white' | 'black'
  /** 导航栏背景色，仅支持 hex、rgba */
  navigationBarBackgroundColor?: string
  /** 导航栏背景色：固定，仅支持 hex、rgba */
  navigationBarBackgroundColorFixed?: string
  /** 补间过渡起始坐标：默认 0 */
  scrollTweenFrom?: number
  /** 补间过渡结束坐标：默认 200 */
  scrollTweenTo?: number
  /** 快捷菜单内容，默认继承自全局定义内容 */
  quickMenu?: QuickMenuOptions
  switchTabUrl?: string
  redirectUrl?: string
  /** H5 隐藏右侧菜单栏（占位） */
  hiddenH5Menu?: boolean
}

export default defineComponent({
  name: 'CommonNavigator',
  props: {
    navigatorStyle: {
      type: String as PropType<NavigatorOptions['navigatorStyle']>,
      default: 'common'
    },
    title: {
      type: undefined as unknown as PropType<NavigatorOptions['title']>
    },
    titleCentered: {
      type: Boolean,
      default: false
    },
    fixedTitle: {
      type: undefined as unknown as PropType<NavigatorOptions['fixedTitle']>
    },
    immersive: {
      type: Boolean as PropType<NavigatorOptions['immersive']>,
      default: false
    },
    showMenuButton: {
      type: Boolean as PropType<NavigatorOptions['showMenuButton']>,
      default: true
    },
    scrollTop: {
      type: Number,
      default: 0
    },
    navigationBarTextStyle: {
      type: String as PropType<NavigatorOptions['navigationBarTextStyle']>,
      default: 'black'
    },
    navigationBarTextStyleFixed: {
      type: String as PropType<NavigatorOptions['navigationBarTextStyleFixed']>,
      default: 'black'
    },
    navigationBarBackgroundColor: {
      type: String as PropType<NavigatorOptions['navigationBarBackgroundColor']>,
      default: '#ffffff'
    },
    navigationBarBackgroundColorFixed: {
      type: String as PropType<NavigatorOptions['navigationBarBackgroundColorFixed']>,
      default: '#ffffff'
    },
    quickMenu: {
      type: Object as PropType<NavigatorOptions['quickMenu']>
    },
    redirectUrl: {
      type: String,
      default: '/packageMain/index'
    },
    // 优先级更高于 redirectUrl
    switchTabUrl: {
      type: String,
      default: ''
    },
    hiddenH5Menu: {
      type: Boolean
    },
    scrollTweenFrom: {
      type: Number,
      default: 0
    },
    scrollTweenTo: {
      type: Number,
      default: 200
    },
    // 需返回 Promise，用于控制是否返回
    whetherBack: {
      type: Function,
      default: () => new Promise((resolve, reject) => resolve())
    }
  },
  setup(props, { slots }) {
    const appStore = useAppStore()
    const { menuButtonRect, commonNavigatorStyle, commonNavigatorHeight } = storeToRefs(appStore)

    const showMenuButton = computed(() => props.showMenuButton ?? true)

    const menuStyleRef = computed(() => {
      const { width, height } = menuButtonRect.value!
      return `
        width: ${showMenuButton.value ? width : width / 2}px;
        height: ${height}px;
      `
    })

    const backToIndex = () => {
      // TODO 支持自定义首页路径
      if (props.switchTabUrl) {
        Taro.switchTab({
          url: props.switchTabUrl
        })
      } else {
        Taro.redirectTo({
          url: props.redirectUrl
        })
      }
    }

    const onBack = () => {
      props
        .whetherBack()
        .then(() => {
          navigateBack(() => {
            backToIndex()
          })
        })
        .catch(() => {
          console.log('无需返回')
        })
    }

    const scrollTween = computed(() => {
      let t = (props.scrollTop - props.scrollTweenFrom) / (props.scrollTweenTo - props.scrollTweenFrom)
      t = t > 1 ? 1 : t < 0 ? 0 : t
      return t
    })

    const textStyle = ref(props.navigationBarTextStyle ?? 'black')
    const setNavigationBarColor = () => {
      const { navigationBarTextStyle = 'black', navigationBarTextStyleFixed = 'black' } = props || {}
      const theme = scrollTween.value <= 0.5 ? navigationBarTextStyle : navigationBarTextStyleFixed
      textStyle.value = theme
      Taro.setNavigationBarColor({
        frontColor: theme === 'white' ? '#ffffff' : '#000000',
        backgroundColor: ''
      })
    }
    setNavigationBarColor()

    watch(() => [props.navigationBarTextStyle, props.navigationBarTextStyleFixed], setNavigationBarColor)

    watch(
      () => scrollTween.value,
      (value, preValue) => {
        if ((value <= 0.5 && preValue > 0.5) || (value > 0.5 && preValue <= 0.5)) {
          setNavigationBarColor()
        }
      }
    )

    const navBgStyle = computed(() => {
      const { navigationBarBackgroundColor = '#ffffff', immersive } = props
      // if (type === 'image') {
      //   return {
      //     backgroundImage: `url(${backgroundImage?.url})`,
      //     backgroundPosition: `0 calc(100% + ${Taro.pxTransform(backgroundHeight)})`,
      //     opacity: 1
      //   }
      // }

      const navigationBarBackgroundColorFixed = props.navigationBarBackgroundColorFixed || navigationBarBackgroundColor

      const c = calcTransitionColor(navigationBarBackgroundColor, navigationBarBackgroundColorFixed, scrollTween.value)

      return {
        backgroundColor: c,
        opacity: immersive ? scrollTween.value : 1
      }
    })

    // TODO 当页面只有一个时，返回按钮换成首页按钮
    return () => {
      const title = slots.title?.() ?? props.title ?? ''
      const fixedTitle = slots.fixedTitle?.() ?? props.fixedTitle
      return (
        <>
          <div
            class={[
              'common-navigator',
              `common-navigator--${textStyle.value}`,
              `common-navigator--${props.navigatorStyle}`,
              !showMenuButton.value && 'common-navigator--no-menu',
              props.titleCentered && 'common-navigator--title-centered'
            ]}
            style={commonNavigatorStyle.value}
          >
            <div class="common-navigator__bg" style={navBgStyle.value}></div>
            {props.navigatorStyle === 'blank' ? (
              <div class="common-navigator__content blank">{slots.default?.() ?? title}</div>
            ) : (
              <div class="common-navigator__content">
                <div class="common-navigator__menu" style={menuStyleRef.value}>
                  <div class="common-navigator__menu-item" onClick={onBack}>
                    <Icon name="back" />
                  </div>
                  {showMenuButton.value && (
                    <>
                      <div class="common-navigator__menu-split"></div>
                      <div
                        class="common-navigator__menu-item"
                        onClick={() => {
                          useQuickMenu(props.quickMenu)
                        }}
                      >
                        <Icon name="menu" />
                      </div>
                    </>
                  )}
                </div>
                <div class="common-navigator__title">
                  <div
                    class={
                      typeof title === 'string'
                        ? 'common-navigator__title-content--text'
                        : 'common-navigator__title-content'
                    }
                    style={{ opacity: fixedTitle ? 1 - scrollTween.value : 1 }}
                  >
                    {title}
                  </div>
                  {fixedTitle && (
                    <div
                      style={{
                        opacity: scrollTween.value,
                        pointerEvents: scrollTween.value > 0.2 ? 'initial' : 'none'
                      }}
                      class={[
                        'common-navigator__title-fixed',
                        typeof fixedTitle === 'string'
                          ? 'common-navigator__title-content--text'
                          : 'common-navigator__title-content'
                      ]}
                    >
                      {fixedTitle}
                    </div>
                  )}
                  {/* <div class="common-navigator__title-text">{title}</div> */}
                </div>
                {process.env.TARO_ENV === 'h5' && !props.hiddenH5Menu && (
                  <div
                    class={['common-navigator__menu', 'common-navigator__menu--h5']}
                    style={menuStyleRef.value}
                  ></div>
                )}
              </div>
            )}
          </div>
          {!props.immersive && <div class="common-navigator-static" style={commonNavigatorStyle.value}></div>}
        </>
      )
    }
  }
})
