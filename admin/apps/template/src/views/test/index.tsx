import { defineComponent } from 'vue'
import type { RouteMeta } from '@/router/routeMeta'

export const routeMeta: RouteMeta = {
  title: 'test的一级路由页面',
  // 为空时自动重定向到该目录下的第一个子路由
  redirect: '',
  order: 20
}

export default defineComponent({
  setup() {
    return () => {
      return (
        <div class="test-index">
          test-index,一级路由
        </div>
      )
    }
  }
})

