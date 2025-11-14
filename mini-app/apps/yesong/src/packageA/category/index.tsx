import { defineComponent } from 'vue'
import Category from '../../packageMain/tab-pages/category/index'

definePageConfig({
  navigationStyle: 'custom',
  disableScroll: true,
  navigationBarTextStyle: 'black'
})

export default defineComponent({
  name: '',
  setup() {
    return () => {
      return <Category isPage />
    }
  }
})
