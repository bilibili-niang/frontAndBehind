import { defineComponent } from 'vue'

export default defineComponent({
  name: 'componentName',
  props: {},
  emits: [''],
  setup(props, { emit }) {
    return () => {
      return <div>首页~</div>
    }
  }
})
