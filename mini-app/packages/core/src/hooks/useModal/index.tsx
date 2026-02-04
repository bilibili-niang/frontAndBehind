import { defineComponent, inject, PropType, provide, reactive, Ref, ref } from 'vue'
import usePopup from '../usePopup'
import { PopupConfig } from '../../components/base-page/popup'
import './style.scss'
import { Icon } from '@pkg/ui'
import { ScrollView } from '@tarojs/components'
import { AnyNodePropType, renderAnyNode, uuid, withUnit } from '@pkg/utils'
import { merge, pick } from 'lodash-es'
import Taro from '@tarojs/taro'
import { useComputedValue } from '../useComputedValue'

const extendsPopupConfig = ['placement', 'maskCloseable', 'maskVisible', 'onClose', 'zIndex', 'catchMove'] as const

type UseModalOptions = {
  title?: AnyNodePropType
  content: any
  height?: number | 'max' | 'auto' | string
  className?: string
  padding?: number
  backgroundColor?: string
  scrollViewDisabled?: boolean
  closeable?: boolean
  key?: string | Ref<string> | (() => string)
  onScrollToLower?: (e: any) => void
} & Pick<PopupConfig, (typeof extendsPopupConfig)[number]>

const extractOptions = (options: Partial<UseModalOptions>) => {
  return {
    ...options
  }
}

const useModal = (options: UseModalOptions) => {
  const config = reactive(extractOptions(options))
  const key = useComputedValue(options.key)
  const popup = usePopup({
    ...config,
    content: () => {
      return (
        <CommonModalContent
          {...(config as any)}
          key={key.value}
          onClose={() => {
            popup.close()
          }}
        />
      )
    },
    placement: options.placement ?? 'bottom'
  })
  const modal = {
    close: () => {
      popup.close()
    },
    update: (newOptions: Partial<UseModalOptions>) => {
      merge(config, extractOptions(newOptions))
      const popupOptions = pick(newOptions, extendsPopupConfig)
      popup.update(popupOptions)
    }
  }
  return modal
}

export default useModal

const CommonModalContent = defineComponent({
  name: 'CommonModalContent',
  props: {
    title: {},
    content: {},
    height: {
      type: [Number, String] as PropType<number | 'max' | 'auto'>
    },
    padding: {
      type: Number
    },
    backgroundColor: {
      type: String
    },
    scrollViewDisabled: {
      type: Boolean,
      default: false
    },
    closeable: {
      type: Boolean,
      default: true
    },
    className: {
      type: String
    },
    onScrollToLower: {
      type: Function as PropType<() => void>
    },
    placement: String
  },
  emits: ['close'],
  setup(props, { slots, emit }) {
    const modalId = `modal-${uuid()}`
    provide('modalId', modalId)
    const withAutoContent = (Cnt: any) => {
      if (props.height === 'auto') {
        return <div class="common-modal-content__content-auto">{Cnt}</div>
      }
      return Cnt
    }

    const query = Taro.createSelectorQuery()
      .select(`.${modalId}`)
      .boundingClientRect()
      .select('.scroll-view')
      .boundingClientRect()

    const exclusiveHeight = ref(0)
    query.exec(res => {
      if (!res[1]) return void 0
      exclusiveHeight.value = res[1].top - res[0]?.top + res[0].bottom - res[1].bottom
    })

    let scrollTop = 0

    return () => {
      const Content = renderAnyNode(props.content) || slots.default?.()
      return (
        <div
          class={[
            'common-modal-content',
            modalId,
            props.className,
            props.height === 'max' && 'max-height',
            props.height === 'auto' && 'auto-height',
            `placement-${props.placement}`
          ]}
          style={{
            backgroundColor: props.backgroundColor,
            height: typeof props.height === 'number' ? withUnit(props.height) : undefined
          }}
        >
          {props.closeable && (
            <div
              class="common-modal-content__close"
              onClick={() => {
                emit('close')
              }}
            >
              <Icon name="close-round" />
            </div>
          )}
          {props.title && <div class="common-modal-content__title">{renderAnyNode(props.title)}</div>}
          <div
            class="common-modal-content__content"
            style={{
              '--modal-exclusive-height': `${exclusiveHeight.value}px`
            }}
          >
            {withAutoContent(
              <>
                {props.scrollViewDisabled ? (
                  Content
                ) : (
                  <ScrollView
                    key={modalId}
                    class="scroller"
                    scrollY
                    showScrollbar
                    // scrollTop={scrollTop}
                    // onScroll={e => {
                    //   scrollTop = e.detail.scrollTop
                    // }}
                    pagingEnabled={false}
                    onScrolltolower={props.onScrollToLower}
                  >
                    <div
                      class="common-modal-content__scroller-content"
                      style={{
                        padding: props.padding !== undefined ? withUnit(props.padding!) : undefined
                      }}
                    >
                      {Content}
                    </div>
                  </ScrollView>
                )}
              </>
            )}
          </div>
        </div>
      )
    }
  }
})

export const ModalFlexScrollViewWrap = defineComponent({
  setup(porps, { slots }) {
    const modalId = inject('modalId')
    const query = Taro.createSelectorQuery()
      .select(`.${modalId}`)
      .boundingClientRect()
      .select('.scroll-view')
      .boundingClientRect()

    const exclusiveHeight = ref(0)
    query.exec(res => {
      exclusiveHeight.value = res[1].top - res[0].top + res[0].bottom - res[1].bottom
    })
    return () => {
      return (
        <div
          class="ModalFlexScrollViewWrap"
          style={{
            '--modal-exclusive-height': `${exclusiveHeight.value}px`
          }}
        >
          {slots.default?.()}
        </div>
      )
    }
  }
})
