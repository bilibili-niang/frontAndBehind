// 选择器的占位
import './style.scss'
import { defineComponent, withModifiers, type PropType } from 'vue'

export default defineComponent({
  name: 'CommonSelector',
  inheritAttrs: true,
  props: {
    icon: {
      type: String
    },
    // 选择后的展示文字
    text: {
      type: Object as PropType<any>
    },
    // 没选择时的文字
    placeholder: {
      type: String,
      default: '请点击选择'
    },
    disable: {
      type: Function,
      default: () => false
    }
  },
  // 选择后点击清空触发
  emits: ['clean', 'click'],
  setup(props, { emit }) {
    return () => {
      return (
        <div
          class={['selector-placeholder', props.text && 'highlight', props.disable() && 'selector-disable']}
          onClick={withModifiers(() => {
            !props.disable() && emit('click')
          }, ['stop', 'prevent'])}
        >
          <div class="disable-mask">
            <div class="dashLine" />
          </div>
          <div class="selector-content clickable">
            <div class="icon">
              <iconpark-icon name={props.icon || 'click'} />
            </div>
            {props.text ? props.text : props.placeholder}
            {props.text && !props.disable() && (
              <div class="selected">
                <iconpark-icon name="check-one" class="success-icon" />
                <iconpark-icon
                  name="error"
                  class="chacha-icon"
                  onclick={withModifiers(() => {
                    emit('clean')
                  }, ['stop', 'prevent'])}
                />
              </div>
            )}
          </div>
        </div>
      )
    }
  }
})
