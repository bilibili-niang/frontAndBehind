import { defineComponent } from 'vue'
import { storeToRefs } from 'pinia'
import { useCounterStore } from '@/stores/counter'
import './index.scss'
import Test from '@/components/test.vue'
import TestSetup from '@/components/test-setup.vue'

definePageConfig({
  navigationBarTitleText: '{{name}}'
})

export default defineComponent({
  name: '',
  setup() {
    const counterStore = useCounterStore()
    const { count } = storeToRefs(counterStore)
    return () => {
      return (
        <div class="index-page">
          <Test />
          <TestSetup name="小猫" gender={1} />
          <div class="count">当前计数器：{count.value}</div>
          <div class="increasement" onClick={counterStore.increasement}>
            点我加1
          </div>
          <div class="footer">安全距离mixin</div>
        </div>
      )
    }
  }
})
