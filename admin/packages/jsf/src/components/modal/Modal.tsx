import { type PropType, defineComponent, reactive, watch } from 'vue'
import './style.scss'
import { ConfigProvider } from '@pkg/ui'
import { PREFIX_CLS } from '../../../../config'
// 移除对 ant-design-vue locale 的直接依赖，改由应用层统一提供

export interface ModalConfig {
  visible?: boolean
  title?: string
  logo?: any
  content?: any
  header?: any
  centered?: boolean
}

export default defineComponent({
  name: 'CommonModal',
  props: {
    visible: {
      type: Boolean as PropType<boolean>
    },
    title: {
      type: String as PropType<string>,
      required: true
    },
    logo: {},
    content: {},
    header: {}
  },
  emits: ['close'],
  setup(props, { slots, emit, expose }) {
    const state = reactive({
      visible: props.visible,
      destroyOnClose: false,
      centered: false
    })

    watch(
      () => props.visible,
      () => {
        state.visible = props.visible
      }
    )

    const show = (cfg?: ModalConfig) => {
      state.visible = true
      state.centered = cfg?.centered ?? false
    }

    const close = () => {
      state.visible = false
      emit('close')
    }

    expose({
      show,
      close
    })
    return () => {
      return (
        <ConfigProvider prefixCls={PREFIX_CLS}>
          {(state.visible || !state.destroyOnClose) && (
            <div class={['jsf-ui-modal', !state.visible && '--hidden', state.centered && '--centered']}>
              <div class="jsf-ui-modal__header">
                <div class="jsf-ui-modal__logo">{props.logo || slots.logo?.()}</div>
                <div class="jsf-ui-modal__title">{props.title}</div>
                {slots.header?.() || props.header}
                <span class="jsf-ui-modal__close clickable" onClick={close}>
                  &times;
                </span>
              </div>
              <div class="jsf-ui-modal__content">{props.content || slots.default?.()}</div>
            </div>
          )}
        </ConfigProvider>
      )
    }
  }
})
