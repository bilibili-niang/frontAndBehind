import { defineComponent } from 'vue'

export default defineComponent({
  name: '',
  setup() {
    return () => {
      return <div class="survey-form-item-error">当前版本暂未支持该题型，跳过作答</div>
    }
  }
})
