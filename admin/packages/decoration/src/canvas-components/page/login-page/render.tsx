import { PropType, computed, defineComponent, onBeforeUnmount, ref } from 'vue'
import './style.scss'
import BasicNaigator from '../../../canvas-components/components/navigator/basic'
import { withUnit } from '../../../canvas-components/utils'
import { Button } from '@pkg/ui'
import { emitter } from '@pkg/core'
import QuickLogin from './quick-login'

export { default as manifest } from './manifest'

export default defineComponent({
  name: 'P_Login',
  props: {
    page: {
      type: Object as PropType<Record<string, any>>,
      required: true
    }
  },
  setup(props, { slots }) {
    // 仅 modal 模式下显示，page 模式下将固定显示
    const closeButton = computed(() => {
      if (!props.page?.closeButton) return null
      const mode = props.page.mode
      const { enable, color, backgroundColor, placement, offsetX, offsetY } = props.page.closeButton
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
    const visible = ref(true)
    const show = () => {
      visible.value = true
    }
    const close = () => {
      visible.value = false
    }

    emitter.on('login-close', close)

    onBeforeUnmount(() => {
      emitter.off('login-close', close)
    })

    return () => {
      if (!props.page) return null
      const mode = props.page.mode
      return (
        <div class={['p_login', `p_login--${mode}`, visible.value ? '--visible' : '--hidden']}>
          <BasicNaigator />
          <Button type="primary" class="p_login-button" onClick={show}>
            立即登录
          </Button>
          <div class="p_login-overlay" onClick={close}></div>
          <div
            class="p_login-popup"
            style={`
            --theme: ${props.page.themeColor};
          `}
          >
            {closeButton.value?.visible && (
              <div class="p_login-close clickable" style={closeButton.value.style} onClick={close}>
                <iconpark-icon name="close-small"></iconpark-icon>
              </div>
            )}
            <QuickLogin
              cancelText={props.page.cancelText}
              onCancel={close}
              userAgreement={props.page.userAgreement}
            >
              {slots.default?.()}
            </QuickLogin>
          </div>
        </div>
      )
    }
  }
})
