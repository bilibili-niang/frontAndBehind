import './index.scss'
import { defineComponent } from 'vue'
import { ROUTE_META_PURE } from '@anteng/core'
import Center from './components/center'
import Left from './components/left'
import Right from './components/right'
import useResumeStore from '../../../stores/resume'

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
        <Left />
        <Center />
        <Right />
      </div>
    )
  }
})

export const routeMeta = {
  title: '新建简历',
  hideInMenu: true,
  [ROUTE_META_PURE]: true,
  order: 2
}