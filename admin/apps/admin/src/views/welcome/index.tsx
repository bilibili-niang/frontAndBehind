import { defineComponent } from 'vue'
import type { RouteMeta } from '@/router/routeMeta'

export default defineComponent({
  name: 'Welcome',
  props: {},
  emits: [''],
  setup(props, { emit }) {
    return () => {
      return (
        <div class="welcome-page">
          欢迎使用~
        </div>
      )
    }
  }
})

export const routeMeta: RouteMeta = {
  title: '欢迎页',
  // 留空字符串表示自动跳转到本目录排序最靠前的子路由
  redirect: '',
  // 是否隐藏侧边菜单
  icon: 'platte',
  hideInMenu: false
}
