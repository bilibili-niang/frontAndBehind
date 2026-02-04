import { computed, defineComponent, onUnmounted, shallowRef, watch } from 'vue'
import './style.scss'
import { withUnit } from '@pkg/utils'
import { useUserStore, useAppStore } from '../../stores'
import QuickLogin from './quick-login'
import config from './config.json'
import { navigateTo } from '../../utils'
import Taro from '@tarojs/taro'
import { useModal } from '../../hooks'
import RichText from '../../components/rich-text'
import { useUserAgreement } from '../user-agreement'

export default defineComponent({
  name: 'LoginView',
  props: {
    reload: {
      type: Boolean,
      default: true
    }
  },
  emits: ['cancel', 'success'],
  setup(props, { emit }) {
    const close = () => {
      emit('cancel')
    }

    onUnmounted(() => {
      close()
    })

    // 如果用户已经登录，则立即关闭，此时ui尚未更新，用户无感知。
    const userStore = useUserStore()
    watch(
      () => userStore.isLogin,
      () => {
        if (userStore.isLogin) close()
      },
      { immediate: true }
    )

    const appStore = useAppStore()

    const loginPageDecorate = computed(() => {
      return config
    })

    // const page = computed(() => loginPageDecorate.value.payload.page)

    const page = computed(() => {
      return loginDeck.value.pageConfig || loginPageDecorate.value.payload.page
    })

    // watch(
    //   () => pageRef.value,
    //   () => {
    //     console.log(pageRef.value, page.value)
    //   },
    //   { immediate: true }
    // )

    // 仅 modal 模式下显示，page 模式下将固定显示
    const closeButton = computed(() => {
      if (!page.value.closeButton) return null
      const mode = page.value.mode
      const { enable, color, backgroundColor, placement, offsetX, offsetY } = page.value.closeButton
      return {
        visible: enable,
        style: {
          color: color,
          backgroundColor: backgroundColor,
          ...(mode === 'modal'
            ? {
                transform: `translate3d(${withUnit(offsetX)}, ${withUnit(offsetY)}, 0)`,
                left: placement === 'topLeft' ? 0 : 'initial',
                right: placement === 'topRight' ? 0 : 'initial'
              }
            : undefined)
        }
      }
    })

    return () => {
      const mode = page.value.mode
      return (
        <div
          class={['p_login', `p_login--${mode}`]}
          style={`
            paddingTop: ${appStore.commonNavigatorHeight}px;
            --theme: ${page.value.themeColor || '#000'}
          `}
        >
          {closeButton.value?.visible && (
            <div class="p_login-close clickable" style={closeButton.value.style} onClick={close}>
              &times;
            </div>
          )}
          <QuickLogin
            cancelText={page.value.cancelText}
            reload={props.reload}
            onCancel={() => {
              emit('cancel')
            }}
            userAgreement={userAgreement.value}
          >
            <div class="p_login-content">{loginDeck.value.deckRender?.() || appStore.loginPageContent}</div>
            {/* <div class="p_login-content">{appStore.loginPageContent}</div> */}
          </QuickLogin>
        </div>
      )
    }
  }
})

const loginDeck = shallowRef({
  pageConfig: null as any,
  userAgreement: null as any,
  deckRender: (() => {}) as () => any
})

const userAgreement = computed(() => {
  const { type, title, link, content } = loginDeck.value.pageConfig?.userAgreement || {
    type: 4,
    link: '',
    title: '用户服务协议',
    content: ''
  }
  if (type === 1) {
    // 同步用户协议页面
    return {
      name: `《${loginDeck.value.userAgreement?.title}》` || '《用户服务协议》',
      handler: () => {
        useUserAgreement(loginDeck.value.userAgreement)
      }
    }
  } else if (type === 2) {
    // 链接
    return {
      name: title || '《用户服务协议》',
      handler: () => {
        navigateTo({
          url: `/packageMain/web?url=${encodeURIComponent(link!)}`
        })
      }
    }
  } else if (type === 3) {
    // 自定义内容
    return {
      name: title || '《用户服务协议》',
      handler: () => {
        useModal({
          title,
          height: 'max',
          content: () => {
            return <RichText content={content} />
          }
        })
      }
    }
  }
  // 默认
  return {
    name: '《用户服务协议》',
    handler: () => {
      Taro.openPrivacyContract()
    }
  }
})
export const useLoginDeck = (options: { pageConfig: any; deckRender: () => any; userAgreement?: any }) => {
  loginDeck.value = Object.assign(loginDeck.value, options)
  console.log(loginDeck.value)
}
