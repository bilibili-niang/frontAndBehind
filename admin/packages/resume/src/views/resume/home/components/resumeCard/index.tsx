import './index.scss'
import { defineComponent } from 'vue'
import { Icon } from '@pkg/ui'
import { formatDate } from '@pkg/core'
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
              <div class="icon-wrapper">
                <Icon name="add" size={32} />
              </div>
              <span class="empty-text">新建简历</span>
            </div>
          </div>
        )
      }
      return (
        <div class="resume-card p-0" onClick={() => router.push(`/resume/create?id=${props.data?.id}`)}>
          {/* 缩略图区域 */}
          <div class="preview-area">
            {/* 暂时使用渐变色块代替缩略图 */}
            <div class="preview-placeholder"></div>
          </div>
          
          <div class="info-area p-3">
            <div class="title text-truncate">{props.data?.title || '未命名简历'}</div>
            <div class="bottom-info-time">
              {formatDate(props.data?.createdAt || props.data?.created_at || '')}
            </div>
          </div>
          
          {/* 悬浮操作栏 - 后续功能预留 */}
          <div class="hover-actions">
            {/* <div class="action-btn"><Icon name="edit" /></div> */}
          </div>
        </div>
      )
    }
  }
})