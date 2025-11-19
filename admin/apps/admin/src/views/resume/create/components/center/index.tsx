import './index.scss'
import { defineComponent } from 'vue'
import Render from '../render/index'

export default defineComponent({
  props: {},
  emits: [''],
  setup(props, { emit }) {
    return () => {
      return (
        <div class="resume-center">

          <Render/>

        </div>
      )
    }
  }
})
