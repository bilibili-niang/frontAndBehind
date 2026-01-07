import './style.scss'
import { computed, defineComponent, h, KeepAlive, ref, Transition, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { menuTree } from '@/router/auto'
import { Button, Icon, Modal, Popover } from '@pkg/ui'
import { ROUTE_META_PURE_INTERFACE } from '@pkg/core'
import { useAuthStore } from '@/store/auth'
import SettingsPanel from '../../components/settingsPanel'
import SidebarMenu from '../../components/sidebarMenu'
import { renderHeader as RenderHeader } from '@pkg/decoration'

export default defineComponent({
    name: 'MainLayout',
    setup() {
      const auth = useAuthStore()
      const route = useRoute()
      const r = useRouter()
      const expanded = ref<Record<string, boolean>>({})
      const pureInterface = computed(() => {
        const val = (route.meta as any)?.[ROUTE_META_PURE_INTERFACE]
        return typeof val === 'boolean' ? val : false
      })
      // 页面独占：仅渲染 RouterView，不显示侧边栏与顶部栏
      const pageOnly = computed(() => {
        const metaVal = (route.meta as any)?.purePage
        const queryVal = new URLSearchParams(window.location.search).get('pageOnly') === 'true'
        return Boolean(metaVal) || queryVal
      })

      // 用户信息与头像、首字母
      const userName = computed(() => {
        const info: any = auth?.userInfo || {}
        return info.userName || info.nickname || info.name || '用户'
      })
      const avatar = computed(() => {
        const info: any = auth?.userInfo || {}
        return info.avatar || null
      })
      const initials = computed(() => (String(userName.value || 'U').slice(0, 1).toUpperCase()))
      const onLogout = async () => {
        try {
          const fn: any = (auth as any)?.logout
          if (typeof fn === 'function') {
            await fn()
          }
        } catch (e) {
          // ignore
        } finally {
          r.push('/login')
        }
      }

      // 进入包含当前子路由的分组时，记录展开状态为 true，后续不随路由切换自动收起
      const ensureActiveGroupExpanded = () => {
        const activeGroup = menuTree.find(g => g.children?.some((c: any) => c.path === route.path))
        if (activeGroup) {
          const key = activeGroup.path || activeGroup.title
          if (expanded.value[key] === undefined) {
            expanded.value[key] = true
          }
        }
      }
      ensureActiveGroupExpanded()
      watch(() => route.path, () => {
        ensureActiveGroupExpanded()
      })

      const openSettings = () => {
        Modal.open({
          title: '设置',
          centered: true,
          width: 560,
          content: () => <SettingsPanel/>,
          maskClosable: true
        })
      }

      return () => (
        pageOnly.value ? (
          <RouterView
            v-slots={{
              default: ({ Component, route }: any) => (
                <Transition name="view-fade" mode="out-in">
                  {route?.meta?.keepAlive ? (
                    <KeepAlive>{h(Component)}</KeepAlive>
                  ) : (
                    h(Component)
                  )}
                </Transition>
              )
            }}
          />
        ) : (
        <div class={{ 'main-layout': true, 'no-sidebar': pureInterface.value }}>
          {!pureInterface.value ? <SidebarMenu/> : null}
          <section class={{
            'main-content': true,
            'main-content-full-width': pureInterface.value,
          }}>
            {/* 顶部工具栏 */}
            <div class={{
              'main-topbar': true,
              'main-topbar-pure-background': pureInterface.value
            }}>
              {pureInterface.value && (
                <Button
                  type="primary"
                  class="header-back-btn"
                  onClick={() => {
                    r.back()
                  }}
                  icon={<Icon name="back-one"/>}
                >
                  返回
                </Button>
              )}

              <div class={{
                'topbar-spacer': true
              }}/>
              {pureInterface.value ? <RenderHeader/>
                :
                <div>
                  <Button
                    onClick={() => {
                      openSettings()
                    }}
                    style={{ marginRight: '8px' }}>
                    <Icon name="seeting"/>
                  </Button>
                  {auth.isLogin ? (
                    <Popover
                      trigger="hover"
                      placement="bottomRight"
                      v-slots={{
                        content: () => (
                          <div class="user-popover">
                            <div class="user-popover__info">
                              <div class="user-avatar">
                                {avatar.value ? (
                                  <img src={avatar.value} alt="avatar"/>
                                ) : (
                                  <span class="user-avatar__text">{initials.value}</span>
                                )}
                              </div>
                              <span class="user-name">{userName.value}</span>
                            </div>
                            <div class="user-popover__actions">
                              <Button size="small" onClick={onLogout}>退出登录</Button>
                            </div>
                          </div>
                        )
                      }}
                    >
                      <button class="topbar-btn user-avatar-btn" aria-label="用户">
                        <div class="user-avatar">
                          {avatar.value ? (
                            <img src={avatar.value} alt="avatar"/>
                          ) : (
                            <span class="user-avatar__text">{initials.value}</span>
                          )}
                        </div>
                      </button>
                    </Popover>
                  ) : null}
                </div>
              }
            </div>

            <div class="bottom-content">
              <RouterView
                v-slots={{
                  default: ({ Component, route }: any) => (
                    <Transition name="view-fade" mode="out-in">
                      {route?.meta?.keepAlive ? (
                        <KeepAlive>{h(Component)}</KeepAlive>
                      ) : (
                        h(Component)
                      )}
                    </Transition>
                  )
                }}
              />
            </div>
          </section>
        </div>
      ))
    }
  }
)