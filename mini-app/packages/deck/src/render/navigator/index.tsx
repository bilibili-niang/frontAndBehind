import { computed, defineComponent, onUnmounted, PropType, ref, watch } from 'vue'
import './style.scss'
import { storeToRefs } from 'pinia'
import Taro from '@tarojs/taro'
import { emitter, useAppStore, useQuickMenu } from '@anteng/core'
import { Icon } from '@anteng/ui'

const backToIndex = () => {
  const url = '/packageMain/index'
  if (process.env.TARO_ENV !== 'h5') {
    try {
      Taro.navigateBack({
        delta: 100,
        fail: err => {
          console.log(err.errMsg)
          Taro.redirectTo({
            url: url
          })
        }
      })
    } catch (err) {
    }
  } else {
    // FIXME 这里可能会造成首页重新渲染？
    Taro.redirectTo({
      url: url
    })
  }
}

export default defineComponent({
  name: 'CommonNavigator',
  props: {
    navigatorStyle: {
      type: String as PropType<'common' | 'blank'>,
      default: 'common'
    },
    navigatorTheme: {
      type: String as PropType<'black' | 'white'>,
      default: 'black'
    },
    title: {},
    /** 是否居中标题（与无菜单搭配使用效果更佳） */
    titleCentered: {
      type: Boolean,
      default: false
    },
    navigatorPlaceholder: {
      type: Boolean,
      default: true
    },
    config: {
      type: Object as PropType<any>
      // required: true
    },
    scrollTop: {
      type: Number,
      default: 0
    }
  },
  // @ts-ignore
  slots: ['title'],
  setup(props, { slots }) {

    // 是否展示返回按钮
    const showBackButton = computed(() => {
      return props.config?.buttons?.leftBack
    })
    // 是否展示快捷菜单按钮
    const showMenuButton = computed(() => {
      return props.config?.buttons?.leftMenu
    })
    // 快捷菜单和返回按钮是否只有一个
    const oneButton = computed(() => {
      return showBackButton.value == !showMenuButton.value
    })

    const hideBackMenu = props.title === '首页'
    const appStore = useAppStore()
    const { menuButtonRect, commonNavigatorStyle, commonNavigatorHeight } = storeToRefs(appStore)

    const menuStyleRef = computed(() => {
      const { width, height } = menuButtonRect.value!
      let style = `
        width: ${oneButton.value ? width / 2 : width}px;
        height: ${height}px;
      `
      // 仅单按钮时，强制移除背景与边框，避免其他样式覆盖
      if (oneButton.value) {
        style += 'background: none; border-color: transparent;'
      }
      return style
    })

    const onBack = () => {
      const pages = Taro.getCurrentPages().filter(item => item.route !== 'pages/launch')
      if (pages.length > 1) {
        Taro.navigateBack({
          delta: 1,
          success(res) {
            console.log(res)
          },
          fail(err) {
            console.log(err)
            backToIndex()
          }
        })
      } else {
        backToIndex()
      }
    }
    // TODO 当页面只有一个时，返回按钮换成首页按钮

    // 默认配置，参考后台示例
    const defaultOptions = () => ({
      title: '',
      navigationBarTextStyle: 'black',
      navigationBarTextStyleFixed: 'black',
      navigationBarBackgroundColor: '#ffffff',
      immersion: false,
      showMenuButton: true,
      titleCentered: false,
      hiddenH5Menu: false,
      foreground: {
        enable: false,
        type: 'color',
        backgroundColor: '#59A9FF',
        backgroundHeight: 0,
        dynamicColor: false
      }
    })

    const navigatorRef = computed(() => {
      return Object.assign(defaultOptions(), props.config || {})
    })

    // 兼容两种字段：immersive 与 immersion
    const isImmersion = computed(() => navigatorRef.value?.immersive ?? navigatorRef.value?.immersion)

    const navBgStyle = computed(() => {
      if (!navigatorRef.value?.foreground) return undefined
      const { enable, type, backgroundImage, backgroundHeight } = navigatorRef.value.foreground
      if (type === 'image') {
        return {
          backgroundImage: `url(${backgroundImage?.url})`,
          backgroundPosition: `0 calc(100% + ${Taro.pxTransform(backgroundHeight)})`,
          opacity: 1
        }
      }
      return {
        backgroundColor:
          navigatorRef.value?.navigationBarBackgroundColor || navigatorRef.value?.backgroundColor,
        opacity: !enable && !isImmersion.value ? 1 : scrollTween.value
      }
    })
    const diffusionStyle = computed(() => {
      if (!navigatorRef.value?.foreground) return undefined
      const {
        enable,
        type,
        backgroundColor,
        backgroundImage,
        backgroundHeight = 0,
        dynamicColor
      } = navigatorRef.value.foreground
      if (!enable) {
        return undefined
      }
      if (type === 'image') {
        return {
          zIndex: 0,
          backgroundImage: `url(${backgroundImage?.url})`,
          backgroundPosition: '0 100%',
          height: `calc(${commonNavigatorHeight.value}px + ${Taro.pxTransform(backgroundHeight)})`
        }
      }
      return {
        backgroundColor: (dynamicColor && tempTheme.value) || backgroundColor,
        height: `calc(${commonNavigatorHeight.value}px + ${Taro.pxTransform(backgroundHeight)})`
      }
    })

    const scrollTween = computed(() => {
      let t = props.scrollTop / (80 * 1)
      t = t > 1 ? 1 : t < 0 ? 0 : t
      return t
    })

    const setNavigationBarColor = () => {
      const {
        navigationBarTextStyle = 'black',
        navigationBarTextStyleFixed = 'black'
      } = navigatorRef.value || {}

      Taro.setNavigationBarColor({
        frontColor:
          scrollTween.value <= 0.5
            ? navigationBarTextStyle === 'black'
              ? '#000000'
              : '#ffffff'
            : navigationBarTextStyleFixed === 'black'
              ? '#000000'
              : '#ffffff',
        backgroundColor: ''
      })
    }
    setNavigationBarColor()

    watch(() => props.config, setNavigationBarColor)
    watch(
      () => scrollTween.value,
      (value, preValue) => {
        if ((value <= 0.5 && preValue > 0.5) || (value > 0.5 && preValue <= 0.5)) {
          setNavigationBarColor()
        }
      }
    )

    const immersive = computed(() => navigatorRef.value?.immersive ?? navigatorRef.value?.immersion)

    /* ---------------------------------- 轮播图联动 --------------------------------- */
    const tempTheme = ref<string | null>(null)
    // 事件通道：优先使用配置中的 channel/pageId/id，其次使用全局通道
    const channel = computed(() => {
      return (
        navigatorRef.value?.dynamicColorChannel ||
        navigatorRef.value?.pageId ||
        navigatorRef.value?.id ||
        ''
      )
    })
    const onThemeChange = (color: string | null) => {
      tempTheme.value = color
    }
    // 绑定带通道的事件
    emitter.on(`nav-swiper-theme-color-${channel.value}`, onThemeChange as any)
    // 同时绑定无通道的全局事件，保证回退可用
    emitter.on(`nav-swiper-theme-color`, onThemeChange as any)

    onUnmounted(() => {
      emitter.off(`nav-swiper-theme-color-${channel.value}`, onThemeChange as any)
      emitter.off(`nav-swiper-theme-color`, onThemeChange as any)
    })

    /* ---------------------------------- 轮播图联动 --------------------------------- */

    return () => {
      const title = navigatorRef.value?.title ?? slots.title?.() ?? props.title ?? ''
      const {
        navigationBarTextStyle = props.navigatorTheme,
        navigationBarTextStyleFixed = props.navigatorTheme,
        hiddenH5Menu
      } = navigatorRef.value || {}
      return (
        <>
          <div
            class={[
              'd_common-navigator',
              `d_common-navigator--${scrollTween.value < 0.5 ? navigationBarTextStyle : navigationBarTextStyleFixed}`,
              !showMenuButton && 'd_common-navigator--no-menu',
              props.titleCentered && 'd_common-navigator--title-centered'
            ]}
            onClick={() => {

            }}
            style={commonNavigatorStyle.value}
          >
            {props.navigatorStyle === 'blank' ? (
              <div class="d_common-navigator__content">{slots.default?.()}</div>
            ) : (
              <>
                <div class="w_basic-nav__bg" style={navBgStyle.value}></div>
                <div class="d_common-navigator__content">
                  {hideBackMenu ? (
                    <div class="d_common-navigator__menu" style="opacity:0"></div>
                  ) : (
                    <div
                      class={{
                        'd_common-navigator__menu': true,
                        'd_common-navigator__menu--h5': process.env.TARO_ENV === 'h5' && hiddenH5Menu,
                        'd_common-navigator__menu--opacity-1': (showBackButton.value || showMenuButton.value),
                        '--no-shadow': oneButton.value
                      }}
                      style={menuStyleRef.value}>
                      {showBackButton.value && (
                        <div class="d_common-navigator__menu-item" onClick={onBack}>
                          <Icon name="back"/>
                        </div>
                      )}

                      {
                        (showBackButton.value && showMenuButton.value)
                          ?
                          <div class="d_common-navigator__menu-split"></div>
                          : ''
                      }

                      {showMenuButton.value && (
                        <div
                          class="d_common-navigator__menu-item"
                          onClick={() => {
                            useQuickMenu()
                          }}
                        >
                          <Icon name="menu"/>
                        </div>
                      )}
                    </div>
                  )}
                  <div
                    class={[
                      'd_common-navigator__title',
                      typeof title === 'string' && 'd_common-navigator__title--text'
                    ]}
                  >
                    <div class="d_common-navigator__title-text">{title}</div>
                  </div>
                </div>
              </>
            )}
          </div>
          <div class="w_basic-nav__diffusion" style={diffusionStyle.value}></div>
          {props.navigatorPlaceholder && !immersive.value && (
            <div class="d_common-navigator-static" style={commonNavigatorStyle.value}></div>
          )}
        </>
      )
    }
  }
})
