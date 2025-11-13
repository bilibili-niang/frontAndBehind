import { defineComponent } from 'vue'

export default defineComponent({
  name: 'componentName',
  props: {},
  emits: [''],
  setup(props, { emit }) {
    return () => {
      return (
        <div>
          jsf测试页面
        </div>
      )
    }
  }
})
