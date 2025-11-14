import './index.scss'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'componentName',
  props: {},
  emits: [''],
  setup(props, { emit }) {
    return () => {
      return (
        <div class="resume-right">
          resume-right
        </div>
      )
    }
  }
})
