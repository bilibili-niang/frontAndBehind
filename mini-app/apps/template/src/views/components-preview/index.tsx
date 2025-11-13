import { defineComponent } from 'vue'
import type { RouteMeta } from '@/router/routeMeta'
import EdgeFloatDemo from '@/pages/EdgeFloatDemo'

export const routeMeta: RouteMeta = {
  title: '组件演示',
  hideInMenu: false,
  order: 999,
  icon: 'cursor-arrow-rays',
  keepAlive: false
}

export default defineComponent({
  name: 'EdgeFloatDemo',
  setup() {
    return () => <EdgeFloatDemo />
  }
})