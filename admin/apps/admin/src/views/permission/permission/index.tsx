import { defineComponent } from 'vue'
import PermissionPage from '@pkg/core/src/views/permission/permission'

export const routeMeta = {
  title: '权限列表',
  requiresAuth: true,
  order: 802
}

export default defineComponent({
  name: 'PermissionPermissionPage',
  setup() {
    return () => <PermissionPage />
  }
})
