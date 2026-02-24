import './index.scss'
import { defineComponent } from 'vue'
import { Icon } from '@pkg/ui'
import { useResumeStore } from '@pkg/resume'

const registry = [
  { type: 'style', label: '页面样式', icon: 'platte' },
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
    const singleAdded = (type: string) => {
      if (type === 'basic-info') {
        const p: any = store.content.profile || {}
        return !!(p.name || p.title || p.email || p.phone || p.location || p.avatar || (p.summary && String(p.summary).trim()))
      }
      if (type === 'summary') {
        const p: any = store.content.profile || {}
        return !!(p.summary && String(p.summary).trim())
      }
      return false
    }
    const getCount = (type: string) => {
      if (type === 'education') return store.content.educations.length
      if (type === 'work') return store.content.experiences.length
      if (type === 'project') return store.content.projects.length
      if (type === 'award') return (store.content as any).awards?.length || 0
      return 0
    }
    const onDragStart = (e: DragEvent, type: string) => {
      e.dataTransfer?.setData('text/plain', type)
    }
    const onAdd = (type: string) => {
      if (type === 'basic-info' || type === 'summary') {
        store.setActiveModule('profile', type === 'summary' ? 'summary' : 'profile')
      } else if (type === 'style') {
        store.setActiveModule('style', 'style')
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
      } else if (type === 'award') {
        const newId = store.addListItem('awards', { name: 'New Award' })
        store.setActiveModule(newId, 'award')
        if (!store.content.layout.order.includes('awards')) {
          store.updateLayoutOrder([...store.content.layout.order, 'awards'])
        }
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
              <div class="prefix">
                {it.icon && (
                  <span class="prefix-icon" aria-label={it.label}>
                    <Icon name={it.icon as any} />
                  </span>
                )}
                <span class="title">{it.label}</span>
              </div>
              <div class="suffix">
                {!it.icon && getCount(it.type) > 0 && (
                  <span class="suffix-badge">{getCount(it.type)}</span>
                )}
                {it.type === 'skills' && Array.isArray(store.content.skills) && store.content.skills.length > 0 && (
                  <span class="suffix-tag">已添加</span>
                )}
                {(it.type === 'basic-info' || it.type === 'summary') && singleAdded(it.type) && (
                  <span class="suffix-tag">已添加</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
})
