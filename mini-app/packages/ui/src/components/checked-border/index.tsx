import { defineComponent } from 'vue'
import './style.scss'
import Icon from '../icon'

export default defineComponent({
  props: {
    checked: Boolean
  },
  setup(props) {
    return () => {
      return (
        <div class={['c_checked-border', props.checked && 'checked']}>
          <div class="check-icon">
            <Icon name="ok-bold" />
          </div>
        </div>
      )
    }
  }
})
