import './index.scss'
import { defineComponent } from 'vue'
import { Icon } from '@anteng/ui'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'ResumeCard',
  props: {
    empty: { type: Boolean, default: false },
    data: {
      type: Object,
      default: () => ({ title: '我的简历', id: 0, createdAt: new Date() })
    }
  },
  setup(props) {
    const router = useRouter()
    return () => {
      if (props.empty) {
        return (
          <div
            class="resume-card resume-card-empty p-1"
            onClick={() => router.push('/resume/create')}
          >
            <div class="empty-icon flex align-center justify-center h-full">
              <Icon name="add" />
            </div>
          </div>
        )
      }
      return (
        <div class="resume-card p-2" onClick={() => router.push(`/resume/create?id=${props.data?.id}`)}>
          <div class="title">{props.data?.title || '未命名简历'}</div>
        </div>
      )
    }
  }
})