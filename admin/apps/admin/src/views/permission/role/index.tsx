import { defineComponent } from 'vue'
import RolePage from '@pkg/core/src/views/permission/role'

export const routeMeta = {
  title: '角色管理',
  requiresAuth: true,
  order: 801
}

export default defineComponent({
  name: 'PermissionRolePage',
  setup() {
    return () => <RolePage />
  }
})
