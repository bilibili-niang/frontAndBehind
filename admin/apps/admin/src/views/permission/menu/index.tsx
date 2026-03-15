import { defineComponent } from 'vue'
import MenuPage from '@pkg/core/src/views/permission/menu'

export const routeMeta = {
  title: '菜单管理',
  requiresAuth: true,
  order: 803
}

export default defineComponent({
  name: 'PermissionMenuPage',
  setup() {
    return () => <MenuPage />
  }
})
