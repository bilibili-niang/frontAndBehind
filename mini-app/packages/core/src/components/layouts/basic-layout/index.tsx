import { computed, defineComponent, KeepAlive, onBeforeUnmount, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterView, useRoute } from 'vue-router'
import './style.scss'
import './style.dark.scss'
import './style.a.scss'
import './style.b.scss'
import './style.c.scss'

import useAppStore, { openSettings } from '../../../stores/app'
import { Badge, Empty, Icon, message, Modal, Popover, Spin, Tooltip } from '@anteng/ui'
import Apps from './apps'
import Menu from './menu'
import PageLabel from './label'
import Breadcrumb from './breadcrumb'
import useBasicLayoutStore from '../../../stores/basic-layout'
import useUserStore from '../../../stores/user'
import useBackgroundTask from '../../../hooks/useBackgroundTask'
import emitter from '../../../utils/emitter'
import { LOGO_URL, PREFIX_CLS, SCOPE_SU } from '@anteng/config'

import defaultAvatar from '../../../assets/default-avatar.svg'
import uuid from '../../../utils/uuid'
import { Exception404 } from '../../../router'
import { authMerchantDirect, getSwitchableMerchantList } from '../../../api/login'
import { useRequestErrorMessage } from '../../../hooks/useRequestErrorMessage'
import { renderAnyNode } from '@anteng/utils'

const exclusion = ['CommonDeckPage']

const getRouterView = (key?: any) => {
  return (
    <RouterView class={`${PREFIX_CLS}-basic-layout__router-view-content keep-alive ui-scrollbar`}>
      {(scope: any) => {
        if (scope.Component?.type.name === 'RouterView') {
          return <KeepAlive exclude={[...exclusion]}>{getRouterView(scope?.route?.name)}</KeepAlive>
        }
        return scope.route.meta.keepAlive === false ? (
          <KeepAlive exclude={[scope.route.name, ...exclusion]}>
            <scope.Component key={uuid()}/>
          </KeepAlive>
        ) : (
          <KeepAlive exclude={[...exclusion]}>{scope.Component}</KeepAlive>
        )
      }}
    </RouterView>
  )
}

const BasicLayout = defineComponent({
  name: 'BasicLayout',
  props: {
    logo: {},
    customButtons: {}
  },
  setup(props, { slots }) {
    const route = useRoute()
    const userStore = useUserStore()
    const { userInfo, merchantInfo } = storeToRefs(userStore)
    const appStore = useAppStore()
    const basicLayoutStore = useBasicLayoutStore()

    const { theme, scope } = storeToRefs(appStore)
    const isLayoutA = computed(() => theme.value.layout === 'layoutA')
    const isLayoutB = computed(() => theme.value.layout === 'layoutB')
    const isLayoutC = computed(() => theme.value.layout === 'layoutC')
    const clickHandler = (name: string) => {
      // message.success(`你点击了「${name}」，好像没有什么事情发生`)
    }

    const showLabelTab = computed(() => {
      return route.matched[0]?.meta?.showLabelTab === true
    })

    const showBreadcrumb = computed(() => {
      return (
        route.path !== '/' &&
        route.matched[route.matched.length - 1]?.meta?.showBreadcrumb !== false &&
        route.matched[0]?.meta?.showBreadcrumb === true
      )
    })

    const userPopoverVisible = ref(false)

    const taskCount = ref(0)
    const refreshTaskCount = () => {
      console.log('获取列表...')
    }
    let timer: NodeJS.Timeout
    onMounted(() => {
      timer = setTimeout(() => {
        refreshTaskCount()
      }, 600)
    })

    onBeforeUnmount(() => {
      clearTimeout(timer)
    })

    // emitter.on('refreshTaskCount', refreshTaskCount)
    emitter.on('setTaskCount', (c) => {
      taskCount.value = c as number
    })

    const FuncButtons = () => {
      const tooltipPlacament = isLayoutA.value ? 'bottom' : 'right'
      return (
        <>
          {renderAnyNode(props.customButtons ?? basicLayoutStore.basicLayoutProps.customButtons)}
          <Tooltip title="后台任务" placement={tooltipPlacament}>
            <Badge size="small" status="warning" offset={[-8, 8]} count={taskCount.value}>
              <div
                class="basic-layout__icon-button clickable"
                onClick={() => {
                  useBackgroundTask()
                }}
              >
                <Icon name="task-fill"></Icon>
              </div>
            </Badge>
          </Tooltip>
          {/* <Tooltip title="消息通知" placement={tooltipPlacament}>
            <div class="basic-layout__icon-button clickable" onClick={() => clickHandler('消息通知')}>
              <Icon name="bell-fill"></Icon>
            </div>
          </Tooltip>
          <Tooltip title="帮助中心" placement={tooltipPlacament}>
            <div class="basic-layout__icon-button clickable" onClick={() => clickHandler('帮助中心')}>
              <Icon name="helper-fill"></Icon>
            </div>
          </Tooltip> */}
          <Tooltip title="设置" placement={tooltipPlacament}>
            <div class="basic-layout__icon-button clickable" onClick={() => openSettings()}>
              <Icon name="settings-fill"></Icon>
            </div>
          </Tooltip>
        </>
      )
    }

    const User = () => (
      <Popover
        trigger="click"
        overlayClassName="basic-layout__user-popover"
        placement={isLayoutA.value ? 'bottomRight' : 'rightTop'}
        autoAdjustOverflow={false}
        open={userPopoverVisible.value}
        onOpenChange={(v) => (userPopoverVisible.value = v)}
        content={
          <div class="basic-layout__user-popover-content">
            <div class="__item">
              <span class="__label">账号</span>
              <span class="__value">{userInfo.value?.account}</span>
            </div>
            <div class="__item">
              <span class="__label">昵称</span>
              <span class="__value">{userInfo.value?.name}</span>
            </div>
            <div class="__divider"></div>
            {/* <div
                class="__item clickable"
                onClick={() => {
                  openSettings('user')
                  userPopoverVisible.value = false
                }}
              >
                <span class="__label">账号设置</span>
                <Icon class="__value" name="people-top-card"></Icon>
              </div> */}
            {scope.value !== SCOPE_SU && (
              <div
                class="__item clickable"
                onClick={() => {
                  useToggleAccount()
                  userPopoverVisible.value = false
                }}
              >
                <span class="__label">切换商户</span>
                <iconpark-icon class="__value" name="toggler"></iconpark-icon>
              </div>
            )}
            <div
              class="__item clickable"
              onClick={() => {
                useUserStore().logout()
                userPopoverVisible.value = false
              }}
            >
              <span class="__label">退出登录</span>
              <iconpark-icon class="__value" name="logout"></iconpark-icon>
            </div>
          </div>
        }
      >
        <div class="basic-layout__user-avatar clickable">
          {/* @ts-ignore */}
          <img src={userInfo.value?.merchantAvatar || userInfo.value?.avatar || defaultAvatar} alt=""/>
          <iconpark-icon class="switch" name="toggler"></iconpark-icon>
          {isLayoutA.value && (
            <>
              <div class="company-name">{userInfo.value?.merchantName || userInfo.value?.name || '用户'}</div>
              <iconpark-icon name="down"></iconpark-icon>
            </>
          )}
        </div>
      </Popover>
    )
    const CurrentApp = () => {
      if (!merchantInfo.value) {
        return (
          <div class="basic-layout-brand current-app">
            <Spin/>
          </div>
        )
      }

      if (!merchantInfo.value.menuName && !merchantInfo.value.menuLogo) {
        return null
      }
      const logo = merchantInfo?.value?.menuLogo?.startsWith('http') ? merchantInfo?.value?.menuLogo : LOGO_URL

      return (
        <div class="basic-layout-brand current-app">
          <img src={logo} draggable={false}/>
          <div class="basic-layout-brand__text current-app">{merchantInfo?.value?.menuName || '合作商后台'}</div>
        </div>
      )
    }

    return () => {
      const MenuRender = <Menu/>

      // console.log(MenuRender)

      if (basicLayoutStore.pageOnly) {
        return (
          <div class={`${PREFIX_CLS}-basic-layout__router-view page-only`}>
            {showLabelTab.value && <PageLabel/>}
            {showBreadcrumb.value && <Breadcrumb/>}
            {getRouterView('basic-layout-router-view')}
            {slots.default?.() ?? (route.path === '/' && <IndexPage/>)}
          </div>
        )
      }

      return (
        <div class={`${PREFIX_CLS}-basic-layout`} data-layout={theme.value.layout}>
          {isLayoutA.value && (
            <div class={`${PREFIX_CLS}-basic-layout__nav`}>
              {/* Logo */}
              <div class="basic-layout__brand">
                {CurrentApp() || (slots.logo?.() ?? props.logo ?? basicLayoutStore.logo ?? <Icon name="logo"></Icon>)}
              </div>
              <div class="basic-layout__apps">{<Apps/>}</div>
              <FuncButtons/>
              <User/>
            </div>
          )}

          <main class={`${PREFIX_CLS}-basic-layout__main`}>
            {isLayoutB.value && (
              <div class={`${PREFIX_CLS}-basic-layout__nav`}>
                <div class="basic-layout__brand">
                  {CurrentApp() || (slots.logo?.() ?? props.logo ?? basicLayoutStore.logo ?? <Icon name="logo"></Icon>)}
                </div>
                <div class="basic-layout__apps">{<Apps/>}</div>
                <User/>
                <FuncButtons/>
              </div>
            )}
            {/* 侧边栏 */}
            {(MenuRender || isLayoutC.value) && (
              <div class={`${PREFIX_CLS}-basic-layout__sider`}>
                {isLayoutC.value && (
                  <div class={`${PREFIX_CLS}-basic-layout__nav`}>
                    <div class="basic-layout__brand">
                      {CurrentApp() ||
                        (slots.logo?.() ?? props.logo ?? basicLayoutStore.logo ?? <Icon name="logo"></Icon>)}
                    </div>
                    <div class="basic-layout__icon-button-container">
                      <FuncButtons/>
                      <User/>
                    </div>
                    <div class="basic-layout__apps">{<Apps/>}</div>
                  </div>
                )}
                {MenuRender}
              </div>
            )}
            <div class={`${PREFIX_CLS}-basic-layout__router-view`}>
              {showLabelTab.value && <PageLabel/>}
              {showBreadcrumb.value && <Breadcrumb/>}
              {getRouterView('basic-layout-router-view')}
              {slots.default?.() ?? (route.path === '/' && <IndexPage/>)}
            </div>
          </main>
        </div>
      )
    }
  }
})

export default BasicLayout

export const BasicLayoutException = defineComponent({
  setup(props) {
    return () => {
      return (
        <div>
          <BasicLayout>
            <Exception404/>
          </BasicLayout>
        </div>
      )
    }
  }
})

export const IndexPage = defineComponent({
  setup(props) {
    return () => {
      return <div></div>
    }
  }
})

const useToggleAccount = () => {
  Modal.open({
    content: <ToggleAcctount/>
  })
}

const ToggleAcctount = defineComponent({
  setup() {
    const userStore = useUserStore()
    const { userInfo } = storeToRefs(userStore)
    const merchantList = ref<any[]>([])

    const isLoading = ref(false)

    const fetchData = () => {
      isLoading.value = true
      getSwitchableMerchantList()
        .then((res) => {
          merchantList.value = res.data
        })
        .catch(useRequestErrorMessage)
        .finally(() => {
          isLoading.value = false
        })
    }

    fetchData()

    const handleToggle = (index: number) => {
      const closeLoading = message.loading('请稍候...')
      const merchant = merchantList.value[index]

      authMerchantDirect({
        token: merchant.directToken,
        scope: useAppStore().scope
      })
        .then((res: any) => {
          localStorage.setItem('Blade-Auth', `${res.token_type} ${res.access_token}`)
          message.success('切换成功')
          // router.replace('/')
          setTimeout(() => {
            // window.location.reload()
            window.location.replace('/center')
          })
        })
        .catch(useRequestErrorMessage)
        .finally(() => {
          closeLoading()
        })
    }

    return () => (
      <div class="toggle-merchant">
        <Spin spinning={isLoading.value}>
          <div class="toggle-merchant__title">
            请选择商户账号
            <a style="font-size:12px;margin-left:8px;" onClick={fetchData}>
              刷新
            </a>
          </div>
          <div class="toggle-merchant__list ui-scrollbar">
            {merchantList.value.length === 0 && <Empty style="margin-top:48px;" description="无可登录的商户账号"/>}
            {merchantList.value.map((item, index) => {
              const isActive = item.id === userInfo.value?.merchantId
              return (
                <div
                  class={['toggle-merchant__item clickable', isActive && 'active']}
                  onClick={() => {
                    handleToggle(index)
                  }}
                >
                  <div class="toggle-merchant__avatar" style={{ backgroundImage: `url(${item.logoImgUri})` }}></div>
                  <div class="toggle-merchant__info">
                    <div class="toggle-merchant__name">{item.name}</div>
                    <div class="toggle-merchant__company">{item.companyName}</div>
                  </div>
                  {isActive && <div class="toggle-merchant__tag">当前登录</div>}
                </div>
              )
            })}
          </div>
        </Spin>
      </div>
    )
  }
})
