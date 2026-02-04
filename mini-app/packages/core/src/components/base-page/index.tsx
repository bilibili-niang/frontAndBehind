import { computed, defineComponent, inject, onBeforeUnmount, onUnmounted, PropType, provide, ref, watch } from 'vue'
import './style.scss'
import Popup, { usePopupClose } from './popup'
import Navigator, { NavigatorOptions } from '../navigator'
import { renderAnyNode, uuid } from '@pkg/utils'
import { BaseEventOrigFunction, ScrollView, ScrollViewProps } from '@tarojs/components'
import Anteng, { emitter, navigateBack, useAppStore, useLogin, useUserStore } from '@pkg/core/lib'
import { storeToRefs } from 'pinia'
import Taro, { useRouter } from '@tarojs/taro'
import useCoreStore from '../../stores/core'
import EmptyStatus, { EmptyAction } from '../empty-status'
import Spin from '../spin'
import { Icon } from '@pkg/ui'
import { onDev } from './dev'

export default defineComponent({
  name: 'c_base-page',
  props: {
    /** 导航栏配置 */
    navigator: {
      type: [Object, null] as PropType<NavigatorOptions | null>
    },
    /** 是否使用 scrollView 代替 pageScroll，默认 false */
    useScrollView: {
      type: Boolean,
      default: false
    },
    /** scrollView 配置，仅 useScrollView 为 true 时有效 */
    scrollView: {
      type: Object as PropType<ScrollViewProps>
    },
    /** 是否开启导航栏占位，默认 false */
    navigatorPlaceholder: {
      type: Boolean,
      default: false
    },
    /** 是否开启导航栏占位，默认 false，开启导航栏占位后忽略 */
    statusbarPlaceholder: {
      type: Boolean,
      default: false
    },
    /** 是否开启 Tab 栏占位，默认 false */
    tabsPlaceholder: {
      type: Boolean,
      default: false
    },
    /** 背景颜色 */
    backgroundColor: {
      type: String
    },
    /** 允许默认分享设置 */
    enableGlobalShare: {
      type: Boolean,
      default: true
    },
    enableShareAppMessage: {
      type: Boolean,
      default: true
    },
    /** 优先渲染这部分内容，适用于于状态展示，此时 slots.default 不渲染 */
    content: {},

    // TODO 改成 <Refresh></Refresh> 来包裹需要自动刷新的组件
    refreshDisabled: {
      type: Boolean
    },
    /** 是否需要登录 */
    needLogin: {
      type: Boolean,
      default: () => false
    },
    /** 页面已失效 */
    expired: {
      type: Boolean,
      default: () => false
    },
    customExpired: {}
  },
  setup(props, { slots }) {
    const userStore = useUserStore()
    const { user, isLogin } = storeToRefs(userStore)
    /** 是否在 BasePage 中 */
    const isInnerBasePage = (inject('isInnerBasePage', false) as Boolean) === true
    provide('isInnerBasePage', true)

    const basePageKey = uuid()
    provide('basePageKey', basePageKey)

    const router = useRouter()

    const isFromScreenCapture = computed(() => {
      return router.params.captureScreen
    })

    let captureScreenTimer: NodeJS.Timeout
    if (isFromScreenCapture.value) {
      // 来源自截图，不显示内容，且在 3 秒内没有跳转响应，重定向至首页
      captureScreenTimer = setTimeout(() => {
        if (useRouter().params.captureScreen) {
          Taro.reLaunch({
            url: '/packageMain/index'
          })
        }
      }, 3000)
    }

    const globalStore = useCoreStore()
    // TODO 嵌套 BasePage 可能存在问题？
    globalStore.setPageMap(basePageKey, router)
    onBeforeUnmount(() => {
      globalStore.removePage(router)
    })

    // 设置是否开启分享
    watch(
      () => props.enableShareAppMessage,
      enable => {
        if (enable) {
          Anteng.showShareMenu()
        } else {
          Anteng.hideShareMenu()
        }
      },
      { immediate: true }
    )

    const appStore = useAppStore()
    const { commonNavigatorHeight, systemInfo, theme, themeColorMap } = storeToRefs(appStore)
    const paddingTop = computed(() => {
      if (props.navigatorPlaceholder) return `${commonNavigatorHeight.value}px`
      if (props.statusbarPlaceholder) return `${systemInfo.value.safeArea?.top}px`
      return 0
    })

    const backgroundColor = computed(() => props.backgroundColor ?? '#f5f5f5')

    /** 如果没有禁用默认分享，且设置了全局默认分享 */
    if (props.enableGlobalShare && globalStore.globalShareHandler && !isInnerBasePage) {
      Taro.useShareAppMessage(globalStore.globalShareHandler)
    }

    // 设置背景色
    watch(
      () => backgroundColor.value,
      () => {
        Taro.setBackgroundColor({
          backgroundColor: backgroundColor.value,
          // backgroundColorTop: backgroundColor.value,
          // backgroundColorBottom: backgroundColor.value
          fail: () => {}
        })
      },
      { immediate: true }
    )

    const pageStyle = computed(() => {
      return {
        backgroundColor: backgroundColor.value,
        '--nav-height': commonNavigatorHeight.value + 'px',
        ...themeColorMap.value
      }
    })

    const contentStyle = computed(() => {
      return {
        paddingTop: paddingTop.value,
        backgroundColor: backgroundColor.value
      }
    })

    const scrollViewProps = computed(() => {
      return {
        // 默认
        enableBackToTop: true,
        // 可控
        ...props.scrollView,
        // 强制
        scrollY: true,
        scrollX: false,
        throttle: false
      }
    })

    /** 页面滚动距离 */
    const scrollTopRef = ref(0)
    provide('scrollTopRef', scrollTopRef)
    /** 监听 scroll-view 滚动, useScrollView: true */
    const onScrollViewScroll: BaseEventOrigFunction<ScrollViewProps.onScrollDetail> = e => {
      scrollTopRef.value = e.detail.scrollTop
    }
    /** 监听原生页面滚动, useScrollView: false */
    Taro.usePageScroll(e => {
      scrollTopRef.value = e.scrollTop
    })

    const scrollTop = ref(scrollTopRef.value)
    emitter.on(`basePageScrollTo:${basePageKey}`, top => {
      if (props.useScrollView) {
        scrollTop.value = top
      } else {
        Taro.pageScrollTo({
          scrollTop: top
        })
      }
    })

    onUnmounted(() => {
      emitter.off(`basePageScrollTo:${basePageKey}`)

      clearTimeout(captureScreenTimer)
    })

    // setTimeout(() => {
    //   useModal({
    //     content: () => <NeedLoginPage />
    //   })
    // }, 1000)

    const Refresh = () => {
      if (process.env.TARO_ENV === 'h5' && process.env.NODE_ENV === 'development') {
        if (!appStore.isInNativeWebView) {
          return null
        }

        return (
          <div class="c_base-page__refresh" onClick={onDev}>
            <Icon name="settings" />
          </div>
        )
      } else {
        return null
      }
    }

    const Content = () => {
      if (isFromScreenCapture.value) {
        return (
          <div class="c_base-page__spin">
            <Spin></Spin>
          </div>
        )
      }

      if (props.needLogin && !isLogin.value) {
        return <NeedLoginPage isInnerBasePage={isInnerBasePage} asTabPage={asTabPage} />
      }
      return (
        <div
          class={['c_base-page__content', props.tabsPlaceholder && 'tabs-placeholder']}
          style={contentStyle.value}
          // 这里使用用户id作为页面的key，可处理退出登录后，页面内容重新渲染
          key={props.refreshDisabled ? undefined : user.value?.id}
        >
          {props.navigator !== null && (
            <Navigator key={basePageKey} {...props.navigator} scrollTop={scrollTopRef.value} />
          )}
          {props.expired ? (
            <div>{renderAnyNode(props.customExpired || <EmptyStatus title="页面已失效" />)}</div>
          ) : props.content ? (
            renderAnyNode(props.content)
          ) : (
            slots.default?.()
          )}
          <Refresh />
        </div>
      )
    }

    const asTabPage = (inject('asTabPage', false) as boolean) ?? false

    return () => {
      return (
        <div
          class={['c_base-page', 'primary-color-blue', `primary-color-${theme.value}`, asTabPage && 'as-tab-page']}
          style={pageStyle.value}
        >
          {props.useScrollView ? (
            // 使用scrollerView 包裹
            <ScrollView
              class="c_base-page__scroller"
              // @ts-ignore
              throttle={false}
              {...(scrollViewProps.value as any)}
              scrollY
              scrollTop={scrollTop.value}
              onRefresherrefresh={scrollViewProps.value.onRefresherRefresh}
              onScrolltolower={scrollViewProps.value.onScrollToLower}
              onScroll={onScrollViewScroll}
            >
              <Content />
            </ScrollView>
          ) : (
            <Content />
          )}
          {!isInnerBasePage && (
            // 非嵌套页面组件才可以使用全局组件，防止多次触发弹窗等内容
            <>
              <Popup />
            </>
          )}
        </div>
      )
    }
  }
})

export const NeedLoginPage = defineComponent({
  props: {
    isInnerBasePage: {
      type: Boolean,
      default: false
    },
    asTabPage: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const popupId = inject('popupId') as string

    const { isUserLoading } = storeToRefs(useUserStore())

    const back = () => {
      if (popupId) {
        // 如果这个页面是在弹窗里面，关闭这个弹窗
        usePopupClose(popupId)
      } else {
        // 直接返回上一页
        navigateBack()
      }
    }

    const login = () => {
      useLogin()
    }

    return () => {
      if (isUserLoading.value) {
        return (
          <div class="c_base-page__need-login">
            <div class="user-loading">
              <Spin />
            </div>
          </div>
        )
      }
      return (
        <div class="c_base-page__need-login">
          <EmptyStatus
            title="未登录"
            description="请登录后查看"
            image={'https://dev-cdn.null.cn/upload/915ed108d5d030f377d56c9317276b09.svg'}
            actions={() => {
              return (
                <>
                  {!props.asTabPage && ( // 作为 tab 页时不显示返回，因为所有 tab 页共用一个路由
                    <EmptyAction
                      // @ts-ignore
                      onClick={back}
                    >
                      返回
                    </EmptyAction>
                  )}
                  {/* @ts-ignore */}
                  <EmptyAction primary onClick={login}>
                    立即登录
                  </EmptyAction>
                </>
              )
            }}
          />
        </div>
      )
    }
  }
})
