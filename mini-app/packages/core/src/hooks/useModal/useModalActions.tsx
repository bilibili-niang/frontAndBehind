import { computed, defineComponent, isRef, PropType, Ref } from 'vue'
import './useModalActions.scss'
import Spin from '../../components/spin'
import { renderAnyNode } from '@anteng/utils'
import { ComputedValue, useComputedValue } from '../useComputedValue'

export type ModalActions = {
  text: string | (() => any)
  primary?: boolean
  className?: string
  disabled?: boolean | (() => boolean) | Ref<boolean>
  loading?: boolean | (() => boolean) | Ref<boolean>
  onClick?: (() => void) | (() => Promise<boolean>)
}[]

const computedValue = (value: any | (() => any) | Ref<any>) => {
  if (isRef(value)) {
    return value.value
  }
  if (typeof value === 'function') {
    return value()
  }
  return value
}

/** 弹窗底部动作 */
export const useModalActions = (
  actions: ComputedValue<ModalActions>,
  options?: {
    fixedBottom?: boolean
    prepend?: () => any
    append?: () => any
  }
) => {
  const Action = defineComponent({
    props: {
      item: {
        type: Object as PropType<ModalActions[number]>,
        required: true
      }
    },
    setup(props) {
      const isLoading = computed(() => {
        return computedValue(props.item.loading)
      })
      const isDisabled = computed(() => {
        return computedValue(props.item.disabled)
      })
      return () => {
        const item = props.item

        return (
          <div
            class={[
              'action',
              item.primary && 'primary',
              isDisabled.value && 'disabled',
              isLoading.value && 'loading',
              item.className
            ]}
            onClick={() => {
              !isDisabled.value && !isLoading.value && item.onClick?.()
            }}
          >
            {isLoading.value && <Spin white={true} class="spin" />}
            {renderAnyNode(item.text)}
          </div>
        )
      }
    }
  })

  const Actions = (props: { prepend?: () => any; append?: () => any }, { attrs }) => {
    const actionsRef = useComputedValue(actions)
    const isFixedBottom = computed(() => options?.fixedBottom ?? true)

    const Content = () => {
      const prepend = props.prepend || options?.prepend
      const append = props.append || options?.append

      return (
        <div class={['common-modal-content__actions']} {...attrs}>
          {prepend && <div class="common-modal-content__actions-prepend">{renderAnyNode(prepend)}</div>}
          <div class="common-modal-content__actions-list">
            {actionsRef.value.map(item => {
              return <Action item={item} />
            })}
          </div>
          {append && <div class="common-modal-content__actions-append">{renderAnyNode(append)}</div>}
        </div>
      )
    }

    return (
      <>
        {/* @ts-ignore */}
        <Content class={isFixedBottom.value && 'fixed-bottom'} />
        {/* @ts-ignore */}
        {isFixedBottom.value && <Content class="common-modal-content__actions-placeholder" />}
      </>
    )
  }
  return {
    Actions
  }
}
