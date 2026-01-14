import { defineComponent, ref } from 'vue'
import { useResumeStore } from '@pkg/resume'

const BasicInfo = (p: any) => (
  <div class="widget widget-basic-info" style={{display:'grid',gridTemplateColumns:'100px 1fr',gap:'12px',alignItems:'center'}}>
    <div class="avatar">{p.avatarUrl && <img src={p.avatarUrl} style={{width:'90px',height:'90px',objectFit:'cover'}}/>}</div>
    <div>
      <div class="title">{p.name || '姓名'}</div>
      <div class="meta">{[p.phone, p.email].filter(Boolean).join(' / ')}</div>
      <div class="meta">{[p.city, p.site, p.wechat].filter(Boolean).join(' / ')}</div>
      <div class="meta">{[p.gender, p.status].filter(Boolean).join(' / ')}</div>
      <div class="meta">{[p.intentJob, p.intentCity, p.salaryMin && `期望薪资 ${p.salaryMin}~${p.salaryMax || ''}`].filter(Boolean).join(' / ')}</div>
      {p.linkedin && <div class="meta">{p.linkedin}</div>}
    </div>
  </div>
)
const Summary = (p: any) => (
  <div class="widget widget-summary">
    <div class="section-title">个人总结</div>
    <div class="text">{p.text || ''}</div>
  </div>
)
const PlainSection = (label: string, p: any) => (
  <div class="widget widget-section">
    <div class="section-title">{label}</div>
    <div class="text">{p.text || ''}</div>
  </div>
)

const registry: Record<string, (p: any) => any> = {
  'basic-info': BasicInfo,
  summary: Summary,
  education: (p) => (
    <div class="widget widget-education">
      <div class="section-title">教育经历</div>
      <div class="meta">{[p.schoolName, p.major, p.degree, p.studyType].filter(Boolean).join(' | ')}</div>
      <div class="meta">{[p.college, p.city].filter(Boolean).join(' / ')}</div>
      <div class="meta">{[p.startDate, p.endDate].filter(Boolean).join(' - ')}</div>
      {Array.isArray(p.tags) && p.tags.length > 0 && (<div class="meta">{p.tags.join(' / ')}</div>)}
      {p.detail && <div class="text">{p.detail}</div>}
    </div>
  ),
  work: (p) => (
    <div class="widget widget-work">
      <div class="section-title">工作经历</div>
      <div class="meta">{[p.company, p.role].filter(Boolean).join(' | ')}</div>
      <div class="meta">{[p.department, p.city].filter(Boolean).join(' / ')}</div>
      <div class="meta">{[p.startDate, p.endDate].filter(Boolean).join(' - ')}</div>
      {Array.isArray(p.techStack) && p.techStack.length > 0 && (<div class="meta">{p.techStack.join(' / ')}</div>)}
      {p.detail && <div class="text">{p.detail}</div>}
    </div>
  ),
  project: (p) => (
    <div class="widget widget-project">
      <div class="section-title">项目经历</div>
      <div class="meta">{[p.name, p.role].filter(Boolean).join(' | ')}</div>
      <div class="meta">{[p.startDate, p.endDate].filter(Boolean).join(' - ')}</div>
      {Array.isArray(p.techStack) && p.techStack.length > 0 && (<div class="meta">{p.techStack.join(' / ')}</div>)}
      {p.link && <div class="meta">{p.link}</div>}
      {p.detail && <div class="text">{p.detail}</div>}
      {Array.isArray(p.images) && p.images.length > 0 && (
        <div class="images" style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
          {p.images.map((u: string) => (<img src={u} style={{width:'100px',height:'60px',objectFit:'cover'}}/>))}
        </div>
      )}
    </div>
  ),
  skills: (p) => PlainSection('专业技能', p),
  award: (p) => (
    <div class="widget widget-award">
      <div class="section-title">获奖</div>
      <div class="meta">{[p.name, p.level].filter(Boolean).join(' | ')}</div>
      <div class="meta">{[p.org, p.date].filter(Boolean).join(' / ')}</div>
      {p.detail && <div class="text">{p.detail}</div>}
    </div>
  )
}

const labelMap: Record<string, string> = {
  'basic-info': '基本信息',
  summary: '个人总结',
  education: '教育经历',
  work: '工作经历',
  project: '项目经历',
  skills: '专业技能',
  award: '获奖'
}

const placeholderComponent = (type: string) => (
  <div class="placeholder-block"><div class="placeholder-title">{labelMap[type] || type}</div></div>
)

export default defineComponent({
  setup() {
    const store = useResumeStore()
    const onSelect = (id: string) => store.select(id)

    const dragging = ref(false)
    const srcIndex = ref<number | null>(null)
    const overIndex = ref<number | null>(null)
    let previewEl: HTMLElement | null = null

    const makePreview = (text: string) => {
      const el = document.createElement('div')
      el.style.cssText = [
        'position:fixed',
        'top:0',
        'left:0',
        'padding:4px 10px',
        'border:1px solid #8b5cf6',
        'background: rgba(99,102,241,0.08)',
        'color:#4c1d95',
        'border-radius:999px',
        'box-shadow:0 6px 18px rgba(0,0,0,.18)',
        'font-size:12px',
        'pointer-events:none'
      ].join(';')
      el.textContent = text
      document.body.appendChild(el)
      return el
    }

    const onBlockDragStart = (e: DragEvent, idx: number) => {
      dragging.value = true
      srcIndex.value = idx
      overIndex.value = idx
      const b = store.blocks[idx]
      previewEl = makePreview(labelMap[b.type] || b.type)
      e.dataTransfer?.setData('text/plain', String(idx))
      e.dataTransfer?.setDragImage(previewEl, 40, 20)
      e.dataTransfer!.effectAllowed = 'move'
    }
    const onBlockDragEnd = () => {
      dragging.value = false
      srcIndex.value = null
      overIndex.value = null
      if (previewEl) { previewEl.remove(); previewEl = null }
    }
    const onBlockDragOver = (e: DragEvent, idx: number) => {
      e.preventDefault()
      const target = e.currentTarget as HTMLElement
      const rect = target.getBoundingClientRect()
      const afterHalf = e.clientY > rect.top + rect.height / 2
      overIndex.value = afterHalf ? idx + 1 : idx
    }
    const commitMove = () => {
      if (srcIndex.value == null || overIndex.value == null) return
      let from = srcIndex.value
      let to = overIndex.value
      if (to > from) to = to - 1
      store.move(from, to)
      onBlockDragEnd()
    }
    const onContainerDrop = (e: DragEvent) => {
      e.preventDefault()
      commitMove()
    }
    const onContainerDragOver = (e: DragEvent) => {
      if (!dragging.value) return
      e.preventDefault()
      const container = e.currentTarget as HTMLElement
      const rect = container.getBoundingClientRect()
      const y = e.clientY - rect.top
      // 当在容器底部区域时，占位到最后
      if (y > rect.height - 20) overIndex.value = store.blocks.length
    }

    const moveUp = (idx: number) => {
      if (idx <= 0) return
      store.move(idx, idx - 1)
    }
    const moveDown = (idx: number) => {
      if (idx >= store.blocks.length - 1) return
      store.move(idx, idx + 1)
    }
    return () => (
      <div class="a4-page" onDrop={onContainerDrop} onDragover={onContainerDragOver} onDragenter={(e: DragEvent) => e.preventDefault()}>
        {store.blocks.map((b, idx) => (
          <>
            {overIndex.value === idx && dragging.value && (
              <div
                class="a4-placeholder"
                onDragover={(e: DragEvent) => { e.preventDefault(); overIndex.value = idx }}
                onDrop={(e: DragEvent) => { e.preventDefault(); commitMove() }}
              >
                {placeholderComponent(store.blocks[srcIndex.value!]?.type)}
              </div>
            )}
            <div
              class={['a4-block', store.selectedId === b.id && 'is-active', dragging.value && srcIndex.value === idx && 'dragging']}
              draggable
              onDragstart={(e: DragEvent) => onBlockDragStart(e, idx)}
              onDragend={onBlockDragEnd}
              onDragover={(e: DragEvent) => onBlockDragOver(e, idx)}
              onDrop={(e: DragEvent) => { e.preventDefault(); commitMove() }}
              onClick={() => onSelect(b.id)}
            >
              {registry[b.type]?.(b.props) || null}
              {store.selectedId === b.id && (
                <div class="a4-block-controls" onClick={(e: MouseEvent) => e.stopPropagation()}>
                  <div class="ctrl-btn" onClick={() => moveUp(idx)}>↑</div>
                  <div class="ctrl-btn" onClick={() => moveDown(idx)}>↓</div>
                </div>
              )}
            </div>
          </>
        ))}
        {overIndex.value === store.blocks.length && dragging.value && (
          <div
            class="a4-placeholder"
            onDragover={(e: DragEvent) => { e.preventDefault(); overIndex.value = store.blocks.length }}
            onDrop={(e: DragEvent) => { e.preventDefault(); commitMove() }}
          >
            {placeholderComponent(store.blocks[srcIndex.value!]?.type)}
          </div>
        )}
      </div>
    )
  }
})