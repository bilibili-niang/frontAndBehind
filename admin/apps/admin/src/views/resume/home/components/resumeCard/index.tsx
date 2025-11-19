// 简历卡片
import './index.scss'
import { defineComponent } from 'vue'
import { Icon } from '@anteng/ui'
import { jumpCreateResume } from '@/router'

export default defineComponent({
  name: 'ResumeCard',
  props: {
    empty: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: () => {
        return {
          name: '我的简历',
          id: 0,
          createTime: new Date(),
        }
      }
    }
  },
  emits: [''],
  setup(props, { emit }) {
    console.log('props:')
    console.log(props)
    return () => {
      if (props.empty) {
        return (<div
          class="resume-card resume-card-empty p-1"
          onClick={() => {
            jumpCreateResume()
          }}
        >
          <div class="empty-icon flex align-center justify-center h-full">
            <Icon name="add"/>
          </div>
        </div>)
      }
      return (
        <div class="resume-card">

        </div>
      )
    }
  }
})
