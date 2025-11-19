import './index.scss'
import { defineComponent } from 'vue'
import Render from '../render'

export default defineComponent({
  setup() {
    return () => (
      <div class="resume-center">
        <Render />
      </div>
    )
  }
})