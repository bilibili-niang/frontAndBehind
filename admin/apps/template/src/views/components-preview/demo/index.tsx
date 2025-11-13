import { defineComponent } from 'vue'
import EdgeFloatDemo from '@/pages/EdgeFloatDemo'
import type { RouteMeta } from '@/router/routeMeta'

export default defineComponent({
  setup() {
    return () => <EdgeFloatDemo />
  }
})

export const routeMeta: RouteMeta = {
  title: 'EdgeFloat组件演示',
  hideInMenu: false,
  order: 1,
  icon: 'cursor-arrow-rays',
  keepAlive: false
}