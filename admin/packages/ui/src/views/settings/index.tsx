import { defineComponent } from 'vue'
import { Spin } from '@anteng/core'

export default defineComponent({
  name: 'Settings',
  props: {},
  emits: [''],
  setup(props, { emit }) {
    return () => {
      return (
        <div class="seeting-page">
          <Spin></Spin>
        </div>
      )
    }
  }
})
