import { defineComponent } from 'vue'
import Cart from './tab-pages/cart'
import { BasePage } from '@pkg/core'
import './cart.scss'

definePageConfig({
  navigationStyle: 'custom',
  disableScroll: true
})

export default defineComponent({
  name: 'ShoppingCartPage',
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
          <div class="shopping-cart-union-page">
            <Cart />
          </div>
        </BasePage>
      )
    }
  }
})
