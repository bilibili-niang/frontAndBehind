import './index.scss'
import { defineComponent, ref, watch, nextTick } from 'vue'
import { Icon, Button, ExpandList } from '@pkg/ui'
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
    const expanded = ref<Record<string, boolean>>({})
    const listTypes = new Set(['education', 'work', 'project', 'award'])

    const inferListTypeById = (id: string): string | null => {
      if (store.content.educations?.some((x: any) => x.id === id)) return 'education'
      if (store.content.experiences?.some((x: any) => x.id === id)) return 'work'
      if (store.content.projects?.some((x: any) => x.id === id)) return 'project'
      if ((store.content as any).awards?.some((x: any) => x.id === id)) return 'award'
      return null
    }

    watch(
      () => [store.activeModuleType, store.activeModuleId] as const,
      async ([type, id]) => {
        if (!id) return

        const targetType = (type && listTypes.has(type) ? type : inferListTypeById(id)) as string | null
        if (!targetType) return

        expanded.value[targetType] = true
        await nextTick()

        const root = document.querySelector('.resume-left .resume-components-list')
        const activeEl = root?.querySelector('.ui-expand-list.has-active-child .child-card.is-active') as HTMLElement | null
        activeEl?.scrollIntoView({ block: 'nearest' })
      },
      { immediate: true }
    )
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
    
    // 映射函数：根据类型返回对应的 items 列表
    const getItems = (type: string) => {
      if (type === 'education') {
        return store.content.educations.map((x: any) => ({
          id: x.id,
          title: [x.school, x.major, x.degree].filter(Boolean).join(' | '),
          sub: [x.startDate, x.endDate].filter(Boolean).join(' - ')
        }))
      }
      if (type === 'work') {
        return store.content.experiences.map((x: any) => ({
          id: x.id,
          title: [x.company, x.position].filter(Boolean).join(' | '),
          sub: [x.startDate, x.endDate].filter(Boolean).join(' - ')
        }))
      }
      if (type === 'project') {
        return store.content.projects.map((x: any) => ({
          id: x.id,
          title: [x.name, x.role].filter(Boolean).join(' | '),
          sub: [x.startDate, x.endDate].filter(Boolean).join(' - ')
        }))
      }
      if (type === 'award') {
        return ((store.content as any).awards || []).map((x: any) => ({
          id: x.id,
          title: [x.name, x.level].filter(Boolean).join(' | '),
          sub: [x.org, x.date].filter(Boolean).join(' / ')
        }))
      }
      return []
    }
    const isListType = (type: string) => ['education', 'work', 'project', 'award'].includes(type)
    const onDragStart = (e: DragEvent, type: string) => {
      e.dataTransfer?.setData('text/plain', type)
    }
    const toggleExpand = (type: string) => expanded.value[type] = !expanded.value[type]
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
    const selectItem = (type: string, id: string) => {
      const typeMap: Record<string, string> = { education: 'education', work: 'work', project: 'project', award: 'award' }
      store.setActiveModule(id, typeMap[type])
    }
    return () => (
      <div class="resume-left">
        <div class="resume-components-list">
          {registry.map((it) => (
            <div draggable onDragstart={(e: DragEvent) => onDragStart(e, it.type)}>
              {isListType(it.type) ? (
                <ExpandList
                  title={it.label}
                  icon={it.icon as any}
                  count={getCount(it.type)}
                  expanded={!!expanded.value[it.type]}
                  onToggle={() => toggleExpand(it.type)}
                  onAdd={() => onAdd(it.type)}
                  items={getItems(it.type)}
                  onItemClick={(id: string) => selectItem(it.type, id)}
                  activeId={store.activeModuleId}
                />
              ) : (
                <div
                  class="resume-component-item"
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
                    {(it.type === 'basic-info' || it.type === 'summary') && singleAdded(it.type) && (
                      <span class="suffix-tag">已添加</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }
})
