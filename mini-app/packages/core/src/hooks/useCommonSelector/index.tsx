import { ConfigProvider, Modal } from '@anteng/ui'
import { defineAsyncComponent, defineComponent, ref, render, type PropType, watch } from 'vue'
import './style.scss'
import { PREFIX_CLS } from '@anteng/config'
import { CommonWidgetPropsDefine } from '@anteng/jsf'
import { type FunctionalWidgetProps } from '@anteng/jsf/src/types/schema'
import { renderAnyNode } from '@anteng/utils'
import useAppStore from '../../stores/app'

/**
 * 通用选择器，数据结构为 { id, name }
 * 控件 widget 必须实现 onSelect({ id, name }) 或 emit('select', { id, name })
 */
const useCommonSelector = (options: {
  widget: any
  placeholder?: string
  icon?: string
  props?: Record<string, any>
  before?: (props: FunctionalWidgetProps) => any
  after?: (props: FunctionalWidgetProps) => any
}) => {
  const { widget, placeholder = '请选择', icon = 'click' } = options

  const selectorProps = options.props

  const SelectorWidget = typeof widget === 'function' ? (defineAsyncComponent(widget as any) as any) : widget
  let modal: any = null
  const modalVisible = ref(true)
  const zIndex = ref()
  const onSelect = ref((record: any) => {})
  const useSelectorModal = (props: FunctionalWidgetProps) => {
    if (!zIndex.value) {
      zIndex.value = useAppStore().getGlobalModalZIndex()
    }

    if (!modal) {
      modal = (
        <ConfigProvider prefixCls={PREFIX_CLS}>
          <Modal
            width={1200}
            zIndex={zIndex.value}
            footer={null}
            centered
            visible={modalVisible.value}
            onCancel={() => (modalVisible.value = false)}
          >
            <SelectorWidget {...props} {...selectorProps} asSelector={true} onSelect={onSelect.value} />
          </Modal>
        </ConfigProvider>
      )
      const container = document.createElement('div')
      render(<modal />, container)
    } else {
      zIndex.value = useAppStore().getGlobalModalZIndex()
    }
    modalVisible.value = true
    return new Promise((resolve, reject) => {
      onSelect.value = (record: any) => {
        resolve(record)
        modalVisible.value = false
      }
    })
  }
  return defineComponent({
    name: 'w_common-selector',
    props: CommonWidgetPropsDefine,
    setup(props, { emit }) {
      const state = ref({
        id: props.value?.id ?? null,
        name: props.value?.name ?? ''
      })
      const triggerChange = () => {
        if (props.onChange) {
          props.onChange?.({ ...state.value })
        } else {
          emit('change', { ...state.value })
        }
      }

      watch(
        () => props.value,
        () => {
          state.value.id = props.value?.id ?? null
          state.value.name = props.value?.name ?? null
        },
        { deep: true }
      )

      const onSelect = () => {
        useSelectorModal(props)
          .then((res: any) => {
            state.value = {
              ...res,
              id: res.id,
              name: res.name || res.title || res.id
            }
            triggerChange()
          })
          .catch((err) => {})
      }
      const onClear = (e: MouseEvent) => {
        e.stopPropagation()
        state.value = {
          id: null,
          name: ''
        }
        triggerChange()
      }

      return () => {
        return (
          <>
            {renderAnyNode(options.before?.(props))}
            <div class="w_common-selector clickable" onClick={onSelect}>
              <div class="w_common-selector__icon">
                <iconpark-icon name={icon}></iconpark-icon>
              </div>
              {state.value.id ? (
                <>
                  <div class="w_common-selector__title">{state.value.name}</div>
                  <div class="w_common-selector__icon --checked">
                    <iconpark-icon name="check-one"></iconpark-icon>
                  </div>
                  <div class="w_common-selector__icon --remove" onClick={onClear}>
                    <iconpark-icon name="error"></iconpark-icon>
                  </div>
                </>
              ) : (
                <div class="w_common-selector__placeholder">{placeholder}</div>
              )}
            </div>
            {renderAnyNode(options.after?.(props))}
          </>
        )
      }
    }
  })
}

export default useCommonSelector

export const CommonSelectorPropsDefine = {
  asSelector: {
    type: Boolean,
    default: false
  },
  onSelect: {
    type: Function as PropType<(data: { id: string; name: string; [key: string]: any }) => void>,
    default: null
  }
}
