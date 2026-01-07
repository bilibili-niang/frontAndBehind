import './index.scss'
import { defineComponent } from 'vue'
import { useResumeStore } from '@pkg/resume'

const registry = [
  { type: 'basic-info', label: '基本信息' },
  { type: 'summary', label: '个人总结' },
  { type: 'education', label: '教育经历' },
  { type: 'work', label: '工作经历' },
  { type: 'project', label: '项目经历' },
  { type: 'skills', label: '专业技能' },
  { type: 'award', label: '获奖' }
]

export default defineComponent({
  name: 'resume-left',
  setup() {
    const store = useResumeStore()
    const onDragStart = (e: DragEvent, type: string) => {
      e.dataTransfer?.setData('text/plain', type)
    }
    const onAdd = (type: string) => {
      store.add(type)
    }
    return () => (
      <div class="resume-left">
        <div class="resume-components-list">
          {registry.map((it) => (
            <div
              class="resume-component-item"
              draggable
              onDragstart={(e: DragEvent) => onDragStart(e, it.type)}
              onClick={() => onAdd(it.type)}
            >
              {it.label}
            </div>
          ))}
        </div>
      </div>
    )
  }
})