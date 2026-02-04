import { computed, defineComponent, inject, PropType } from 'vue'
import './style.scss'
import { storeToRefs } from 'pinia'
import { Button } from '@tarojs/components'
import { useAppStore } from '../../stores'
import { Icon } from '@pkg/ui'
import usePopup from '../usePopup'
import useCoreStore from '../../stores/core'
import { REQUEST_DOMAIN } from '../../api/request'

const resolveIcon = (url?: string) => {
  if (!url) return url as any
  const lower = url.toLowerCase()
  if (lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('data:')) return url
  if (url.startsWith('/')) return `${REQUEST_DOMAIN}${url}`
  return `${REQUEST_DOMAIN}/${url}`
}

export type QuickMenuItem = {
  key: string
  name: string
  icon: string
  hidden?: boolean
  handler?: () => void
  openType?: OpenType
  openTypeParams?: { [key: string]: any }
}

type OpenType =
  | 'contact' // 打开客服会话
  | 'liveActivity' // 通过前端获取新的一次性订阅消息下发机制使用的 code
  | 'share' // 触发用户转发，使用前建议先阅读使用指引
  | 'getPhoneNumber' // 手机号快速验证，向用户申请，并在用户同意后，快速填写和验证手机
  | 'getRealtimePhoneNumber' // 手机号实时验证，向用户申请，并在用户同意后，快速填写和实时验证手机号。
  | 'getUserInfo' // 获取用户信息
  | 'launchApp' // APP
  | 'openSetting' // 打开授权设置页
  | 'feedback' // 打开“意见反馈”页面
  | 'chooseAvatar' // 获取用户头像
  | 'agreePrivacyAuthorization' // 用户同意隐私协议按钮

const Menu = defineComponent({
  name: 'CommonNavigatorMenu',
  props: {
    list: {
      type: Array as PropType<QuickMenuItem[]>,
      required: true
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const close = () => {
      emit('close')
    }
    const appStore = useAppStore()
    const { commonNavigatorStyle } = storeToRefs(appStore)
    const coreStore = useCoreStore()
    const { disabledSharePages } = storeToRefs(coreStore)
    const basePageKey = inject('basePageKey') as string
    const isDisabledShare = computed(() => {
      return disabledSharePages.value.includes(basePageKey)
    })

    const list = computed(() => {
      return props.list.filter(item => {
        // 禁止分享时剔除分享按钮
        if (isDisabledShare.value && item.openType === 'share') {
          return false
        }
        return true
      })
    })

    return () => {
      return (
        <div class="common-navigator-menu">
          <div class="common-navigator-menu__header" style={commonNavigatorStyle.value}>
            快捷导航
          </div>
          <div class="common-navigator-menu__list">
            {list.value.map(item => {
              if (item.hidden) return null
              return (
                <div
                  class="common-navigator-menu__item"
                  key={item.name}
                  onClick={() => {
                    close()
                    item.handler?.()
                  }}
                >
                  {item.openType && <Button class="common-navigator-menu__open-type" openType={item.openType as any} />}
                  <div class="common-navigator-menu__item-icon">
                    {item.icon && (item.icon.startsWith('http') || item.icon.startsWith('/')) ? (
                      <div class="image" style={{ backgroundImage: `url(${resolveIcon(item.icon)})` }}></div>
                    ) : (
                      <Icon name={item.icon} />
                    )}
                  </div>
                  <span class="common-navigator-menu__item-name">{item.name}</span>
                </div>
              )
            })}
          </div>
        </div>
      )
    }
  }
})

export type QuickMenuOptions = {
  /** 列表 */
  list?: QuickMenuItem[]
  /** 排除 */
  excludes?: (QuickMenuItem | string)[]
}

const useQuickMenu = (options?: QuickMenuOptions) => {
  const gloablStore = useCoreStore()
  const excludes = options?.excludes ?? []
  const list = (options?.list ?? gloablStore.menuList).filter(item => {
    if (excludes.length > 0) {
      return !excludes.find(i => item.key === i || item === i)
    }
    return true
  })
  const { close } = usePopup({
    content: <Menu list={list} onClose={() => close()} />,
    placement: 'top'
  })
  return { close }
}

export default useQuickMenu
