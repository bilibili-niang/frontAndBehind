import { computed, defineComponent } from 'vue'
import './style.scss'
import Icon from '../icon'

export default defineComponent({
  name: 'c_radio',
  props: {
    checked: {
      type: Boolean
    },
    value: {},
    currentValue: {}
  },
  emits: {
    change: (value: any) => true
  },
  setup(props, { emit }) {
    const checked = computed(
      () => props.checked ?? (props.value && props.currentValue && props.value === props.currentValue)
    )
    return () => {
      return (
        <div
          class={['c_radio', checked.value && 'c_radio--checked']}
          onClick={() => {
            emit('change', props.value)
          }}
        >
          <div class="c_radio-button">
            <Icon name="check-small" />
          </div>
        </div>
      )
    }
  }
})
