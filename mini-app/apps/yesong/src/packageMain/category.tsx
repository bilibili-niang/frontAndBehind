import { defineComponent } from 'vue'
import Category from './tab-pages/category'

definePageConfig({
  navigationStyle: 'custom',
  disableScroll: true,
  navigationBarTextStyle: 'black'
})

export default defineComponent({
  name: '',
  setup() {
    return () => {
      return <Category />
    }
  }
})
