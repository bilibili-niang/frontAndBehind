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
      default: () => ({ name: '我的简历', id: 0, createTime: new Date() })
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
      return <div class="resume-card"></div>
    }
  }
})