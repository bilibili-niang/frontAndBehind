import { PropType, SlotsType, defineComponent } from 'vue'
import './style.scss'
import { useLogin } from '../../hooks'
import { Image } from '@tarojs/components'
import { REQUEST_DOMAIN } from '../../api/request'

export type EmptyTypes = 'default' | 'login' | (string & {})

export default defineComponent({
  name: 'c_empty',
  props: {
    type: {
      type: String as PropType<EmptyTypes>,
      default: 'default'
    },
    title: {},
    description: {},
    image: {},
    size: {
      type: String as PropType<'normal' | 'small'>,
      default: 'normal'
    },
    textOnly: {
      type: Boolean,
      default: false
    },
    actions: {
      type: Function
    }
  },
  slots: Object as SlotsType<{
    default: () => any
    actions: () => string
  }>,
  setup(props, { slots }) {
    const defaultDesc = {
      default: '暂无内容',
      login: '请登录后查看'
    }
    return () => {
      const image = props.image ?? REQUEST_DOMAIN+'/empty.png'
      const actions = props.actions?.() ?? slots.actions?.()
      return (
        <div class={['c_empty', `c_empty--${props.size}`, props.textOnly && 'text-only']}>
          {!props.textOnly &&
            (typeof image === 'string' ? <Image class="c_empty-image" mode="aspectFit" src={image} /> : image)}

          {props.title && <div class="c_empty-title">{props.title}</div>}
          <div class="c_empty-text">{props.description ?? defaultDesc[props.type]}</div>
          {props.type === 'login' && (
            <div class="c_empty-login-btn" onClick={() => useLogin()}>
              立即登录
            </div>
          )}
          {actions && <div class="c_empty-actions">{actions}</div>}
          {slots.default?.()}
        </div>
      )
    }
  }
})

export const EmptyAction = (
  props: {
    primary?: boolean
    onClick?: () => void
  },
  { slots }
) => {
  return (
    <div class={['c_empty-action', props.primary && 'c_empty-action--primary']} {...props}>
      {slots.default?.()}
    </div>
  )
}
