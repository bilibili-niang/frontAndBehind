import './style.scss'
import { defineComponent, type PropType } from 'vue'
import { PREFIX_CLS } from '@anteng/config'

export default defineComponent({
  name: 'ThemeSwitch',
  props: {
    checked: { type: Boolean, default: false }, // true = dark
    disabled: { type: Boolean, default: false },
    size: { type: String as PropType<'small' | 'default' | 'large'>, default: 'small' }
  },
  emits: ['change', 'update:checked'],
  setup(props, { emit, attrs }) {
    const id = `theme-switch-${Math.round(Math.random() * 100000)}`

    const onChange = (e: Event) => {
      if (props.disabled) return
      const next = (e.target as HTMLInputElement).checked
      emit('update:checked', next)
      emit('change', next)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (props.disabled) return
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        emit('update:checked', !props.checked)
        emit('change', !props.checked)
      }
    }

    return () => {
      const cls = [
        `${PREFIX_CLS}-theme-switch`,
        props.checked ? 'is-dark' : 'is-light',
        props.size === 'large' ? 'size-large' : props.size === 'default' ? 'size-default' : 'size-small',
        props.disabled && 'is-disabled',
        attrs.class as any
      ]

      return (
        <div class={cls} {...attrs}>
          <input
            id={id}
            type="checkbox"
            role="switch"
            class="switch__input"
            aria-checked={props.checked}
            checked={props.checked}
            disabled={props.disabled}
            tabindex={props.disabled ? -1 : 0}
            onChange={onChange}
            onKeydown={onKeyDown}
          />
          <label class="switch__label" for={id} aria-hidden="true">
            <span class="switch__knob">
              {/* 太阳图标（浅色） */}
              <svg class="switch__icon switch__icon--light" viewBox="0 0 12 12" width="12" height="12">
                <g fill="none" stroke="#fff" stroke-width="1" stroke-linecap="round">
                  <circle cx="6" cy="6" r="2" />
                  <g stroke-dasharray="1.5 1.5">
                    <polyline points="6 10,6 11.5" transform="rotate(0,6,6)" />
                    <polyline points="6 10,6 11.5" transform="rotate(45,6,6)" />
                    <polyline points="6 10,6 11.5" transform="rotate(90,6,6)" />
                    <polyline points="6 10,6 11.5" transform="rotate(135,6,6)" />
                    <polyline points="6 10,6 11.5" transform="rotate(180,6,6)" />
                    <polyline points="6 10,6 11.5" transform="rotate(225,6,6)" />
                    <polyline points="6 10,6 11.5" transform="rotate(270,6,6)" />
                    <polyline points="6 10,6 11.5" transform="rotate(315,6,6)" />
                  </g>
                </g>
              </svg>
              {/* 月牙图标（深色） */}
              <svg class="switch__icon switch__icon--dark" viewBox="0 0 12 12" width="12" height="12">
                <g fill="none" stroke="#fff" stroke-width="1" stroke-linejoin="round" transform="rotate(-45,6,6)">
                  <path d="m9,10c-2.209,0-4-1.791-4-4s1.791-4,4-4c.304,0,.598.041,.883.105-.995-.992-2.367-1.605-3.883-1.605C2.962.5.5,2.962.5,6s2.462,5.5,5.5,5.5c1.516,0,2.888-.613,3.883-1.605-.285.064-.578.105-.883.105Z" />
                </g>
              </svg>
            </span>
          </label>
        </div>
      )
    }
  }
})