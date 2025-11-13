import { defineComponent } from 'vue'
import type { RouteMeta } from '@/router/routeMeta'

export default defineComponent({
  name: 'Home',
  setup() {
    return () => (
      <div class="home-parent" />
    )
  },
})

export const routeMeta: RouteMeta = {
  title: '首页',
  // 为空则自动重定向到该目录下的第一个子路由（由 auto.ts 处理）
  redirect: '',
  order: 0
}
