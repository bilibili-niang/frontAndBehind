import { defineComponent } from 'vue'
import type { RouteMeta } from '@/router/routeMeta'

// 作为父级目录路由，默认重定向到该目录的首个子页面
export const routeMeta: RouteMeta = {
  title: '装修',
  // 留空字符串表示自动跳转到本目录排序最靠前的子路由
  redirect: '',
  icon: 'platte'
}

// 提供一个兜底组件，避免因为未导出默认组件导致路由初始化报错
export default defineComponent({
  name: 'DecorationRoot',
  setup() {
    return () => (
      <div style={{ padding: '16px' }}>
        正在跳转到装修页...
      </div>
    )
  }
})
