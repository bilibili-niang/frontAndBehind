import { defineComponent } from 'vue'
import UserRolePage from '@pkg/core/src/views/permission/user-role'

export const routeMeta = {
  title: '用户分配',
  requiresAuth: true,
  order: 804
}

export default defineComponent({
  name: 'PermissionUserRolePage',
  setup() {
    return () => <UserRolePage />
  }
})
