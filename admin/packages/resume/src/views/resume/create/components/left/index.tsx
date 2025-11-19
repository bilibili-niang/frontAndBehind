import './index.scss'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'resume-left',
  setup() {
    return () => (
      <div class="resume-left">
        <div class="used-list"></div>
        <div class="resume-components-list"></div>
      </div>
    )
  }
})