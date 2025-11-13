import './index.scss'
import { defineComponent } from 'vue'
import { Button as AntButton } from 'ant-design-vue'

// UiButton: 兼容示例项目的 color/variant/type API，并映射到 Antd Button
export default defineComponent({
  name: 'UiButton',
  props: {
    type: {
      type: String as () => 'default' | 'primary' | 'dashed' | 'link' | 'text' | 'danger' | undefined,
      default: undefined
    },
    color: { type: String, default: undefined },
    variant: {
      type: String as () => 'text' | 'flat' | 'elevated' | 'tonal' | 'outlined' | 'plain' | undefined,
      default: undefined
    },
    size: {
      type: String as () => 'x-small' | 'small' | 'default' | 'large' | 'x-large' | undefined,
      default: undefined
    },
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },
  setup(props, { slots, attrs }) {
    // size 映射到 Antd: small | middle | large
    const mapSize = (s?: string) => {
      switch (s) {
        case 'x-small':
        case 'small':
          return 'small'
        case 'large':
        case 'x-large':
          return 'large'
        default:
          return undefined // 使用 Antd 默认 middle
      }
    }

    const dangerByType = props.type === 'danger'

    const antdType = (() => {
      // 明确传入 type 时优先
      if (props.type) {
        if (props.type === 'default' || props.type === 'danger') return undefined
        return props.type
      }
      // variant 优先
      if (props.variant === 'text') return 'text'
      if (props.variant === 'outlined') {
        // outlined 希望主色描边：primary + ghost
        if (props.color === 'primary') return 'primary'
        return undefined
      }
      // 非 outlined/text，根据 color 控制主色
      if (props.color === 'primary') return 'primary'
      return undefined
    })()

    const ghost = props.variant === 'outlined'
    const danger = dangerByType || props.color === 'danger' || props.color === 'error'

    const className = attrs?.class as any

    return () => (
      <AntButton
        type={antdType as any}
        danger={danger}
        ghost={ghost}
        loading={props.loading}
        disabled={props.disabled}
        size={mapSize(props.size) as any}
        class={className}
        {...attrs}
      >
        {slots.default?.()}
      </AntButton>
    )
  }
})
