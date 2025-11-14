import './index.scss'
import { defineComponent } from 'vue'
import { RouteMeta } from '@/router/routeMeta'
import { ROUTE_META_PURE } from '@anteng/core'
import Center from './components/center'

export default defineComponent({
  name: 'resume-create-page',
  setup() {

    return () => (
      <div class="resume-create-page">
        <Center/>
      </div>
    )
  }
})

export const routeMeta: RouteMeta = {
  title: '新建简历',
  hideInMenu: true,
  // 是否隐藏侧边菜单
  [ROUTE_META_PURE]: true,
  order: 2
}