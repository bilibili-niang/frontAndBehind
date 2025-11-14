import HOME from '../assets/main-tab/home.svg'
import HOME_ACTIVE from '../assets/main-tab/home-active.svg'
import CATEGORY from '../assets/main-tab/category.svg'
import CATEGORY_ACTIVE from '../assets/main-tab/category-active.svg'
import CART from '../assets/main-tab/cart.svg'
import CART_ACTIVE from '../assets/main-tab/cart-active.svg'
import PROFILE from '../assets/main-tab/profile.svg'
import PROFILE_ACTIVE from '../assets/main-tab/profile-active.svg'
export const MAIN_PAGE_TABS = [
  {
    key: 'home',
    text: '首页',
    icon: HOME,
    activeIcon: HOME_ACTIVE
  },
  {
    key: 'category',
    text: '分类',
    icon: CATEGORY,
    activeIcon: CATEGORY_ACTIVE
  },
  {
    key: 'cart',
    text: '购物车',
    icon: CART,
    activeIcon: CART_ACTIVE
  },
  {
    key: 'profile',
    text: '我的',
    icon: PROFILE,
    activeIcon: PROFILE_ACTIVE
  }
]
