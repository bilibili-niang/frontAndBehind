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
      if (type === 'basic-info' || type === 'summary') {
        store.setActiveModule('profile', 'profile')
      } else if (type === 'education') {
        // 先选中教育模块
        // 如果想自动添加一条，可以调用 addListItem
        const newId = store.addListItem('educations', { school: 'New School' })
        store.setActiveModule(newId, 'education')
      } else if (type === 'work') {
        const newId = store.addListItem('experiences', { company: 'New Company' })
        store.setActiveModule(newId, 'work')
      } else if (type === 'project') {
        const newId = store.addListItem('projects', { name: 'New Project' })
        store.setActiveModule(newId, 'project')
      } else if (type === 'skills') {
        store.setActiveModule('skills', 'skills')
      }
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