import './index.scss'
import { defineComponent } from 'vue'
// import componentsStore from ''

export default defineComponent({
  name: 'componentName',
  props: {},
  emits: [''],
  setup(props, { emit }) {
    return () => {
      return (
        <div class="resume-left">
          {/*当前使用的组件列表*/}
          <div class="used-list">

          </div>
          {/*可以使用的组件列表*/}
          <div class="resume-components-list">

          </div>
        </div>
      )
    }
  }
})
