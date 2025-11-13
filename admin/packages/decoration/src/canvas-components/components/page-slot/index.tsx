import { defineComponent } from 'vue'
import './style.scss'

export default defineComponent({
  name: 'PageSlot',
  setup() {
    return () => {
      return <div class="w_page-slot"></div>
    }
  }
})
