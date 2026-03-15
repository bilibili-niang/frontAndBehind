import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'

export const routeMeta = {
  title: '权限管理',
  requiresAuth: true,
  order: 800,
  icon: 'lock'
}

export default defineComponent({
  name: 'PermissionIndexPage',
  setup() {
    return () => <RouterView />
  }
})
