import { defineComponent } from 'vue'

export default defineComponent({
  name: 'w_slots',
  setup() {
    return () => {
      return <div class="w_slots">slots</div>
    }
  }
})
