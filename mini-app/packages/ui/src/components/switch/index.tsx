import { defineComponent } from 'vue'
import './style.scss'
import Taro from '@tarojs/taro'

export default defineComponent({
  name: 'c_switch',
  props: {
    checked: {
      type: Boolean
    },
    disabled: {
      type: Boolean
    }
  },
  emits: {
    change: (value: any) => true
  },
  setup(props, { emit }) {
    return () => {
      return (
        <div
          class={['c_switch', props.checked && 'c_switch--checked']}
          onClick={() => {
            if (!props.disabled) {
              emit('change', !props.checked)
            }
          }}
          onTouchstart={() => {
            Taro.vibrateShort({
              type: 'light'
            })
          }}
        >
          <div class="c_switch-button">
            <div class="c_switch-thumb"></div>
          </div>
        </div>
      )
    }
  }
})
