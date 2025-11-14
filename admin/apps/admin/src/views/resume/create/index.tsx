import './index.scss'
import { defineComponent } from 'vue'
import { RouteMeta } from '@/router/routeMeta'
import { ROUTE_META_PURE } from '@anteng/core'
import Center from './components/center'
import Left from './components/left'
import Right from './components/right'
import useResumeStore from '../../../store/resume'

export default defineComponent({
  name: 'resume-create-page',
  setup() {
    const { resumeData } = useResumeStore()

    return () => (
      <div
        class="resume-create-page"
        onClick={() => {
          console.log('resumeData:')
          console.log(resumeData)
        }}
      >
        <Left/>
        <Center/>
        <Right/>
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