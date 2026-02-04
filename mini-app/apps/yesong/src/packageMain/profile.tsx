import { BasePage } from '@pkg/core'
import { defineComponent } from 'vue'
import Profile from './tab-pages/profile'

definePageConfig({
  navigationStyle: 'custom',
  disableScroll: true
})

export default defineComponent({
  name: '',
  setup() {
    return () => {
      return (
        <BasePage
          navigator={{
            title: '',
            showMenuButton: false,
            navigationBarBackgroundColor: 'transparent',
            navigatorStyle: 'immersive'
          }}
        >
          <Profile />
        </BasePage>
      )
    }
  }
})
