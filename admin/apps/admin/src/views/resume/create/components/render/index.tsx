import { defineComponent } from 'vue'

export default defineComponent({
  props: {},
  emits: [''],
  setup(props, { emit }) {
    return () => {
      return (
        <div class="render">
          render
        </div>
      )
    }
  }
})
