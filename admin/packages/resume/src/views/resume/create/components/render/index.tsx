import { defineComponent, ref } from 'vue'
import { useResumeStore } from '@pkg/resume'

const BasicInfo = (p: any) => {
  const hasAny = !!(p?.name || p?.phone || p?.email || p?.location || p?.summary || p?.avatar)
  if (!hasAny) return null
  return (
    <div class="widget widget-basic-info" style={{display:'grid',gridTemplateColumns:'100px 1fr',gap:'12px',alignItems:'center'}}>
      <div class="avatar">{p.avatar && <img src={p.avatar} style={{width:'90px',height:'90px',objectFit:'cover'}}/>}</div>
      <div>
        {p.name && <div class="title">{p.name}</div>}
        <div class="meta">{[p.phone, p.email].filter(Boolean).join(' / ')}</div>
        {p.location && <div class="meta">{p.location}</div>}
        {p.summary && <div class="text">{p.summary}</div>}
      </div>
    </div>
  )
}
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
      <div class="meta">{[p.school, p.major, p.degree].filter(Boolean).join(' | ')}</div>
      <div class="meta">{[p.startDate, p.endDate].filter(Boolean).join(' - ')}</div>
      {p.description && <div class="text">{p.description}</div>}
    </div>
  ),
  work: (p) => (
    <div class="widget widget-work">
      <div class="section-title">工作经历</div>
      <div class="meta">{[p.company, p.position].filter(Boolean).join(' | ')}</div>
      <div class="meta">{[p.startDate, p.endDate].filter(Boolean).join(' - ')}</div>
      {p.description && <div class="text">{p.description}</div>}
    </div>
  ),
  project: (p) => (
    <div class="widget widget-project">
      <div class="section-title">项目经历</div>
      <div class="meta">{[p.name, p.role].filter(Boolean).join(' | ')}</div>
      <div class="meta">{[p.startDate, p.endDate].filter(Boolean).join(' - ')}</div>
      {p.description && <div class="text">{p.description}</div>}
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
    const onSelect = (id: string, type: string) => store.setActiveModule(id, type)

    // 暂时移除拖拽逻辑，等后续 Story 实现左侧拖拽时再加回来
    // 现在的 Render 只负责渲染
    
    return () => (
      <div class="a4-page" style={{ color: '#333', padding: `${store.themeConfig.pagePadding ?? 24}px` }} onClick={() => store.setActiveModule(null, null)}>
        {/* 遍历布局顺序 */}
        {store.content.layout.order.map((key) => {
          // 获取模块数据
          const data = store.content[key as keyof typeof store.content]
          
          // 如果是对象类型（Profile），渲染单个
          if (key === 'profile') {
             const node = registry['basic-info']?.(data)
             if (!node) return null
             return (
               <div 
                 class={['a4-block', store.activeModuleId === 'profile' && 'is-active']}
                 style={{ 
                   padding: `${store.themeConfig.blockPadding ?? 16}px`, 
                   marginBottom: `${store.themeConfig.blockGap ?? 12}px`
                 }}
                 onClick={(e) => { e.stopPropagation(); onSelect('profile', 'profile') }}
               >
                 {node}
                 {store.themeConfig.blockDividerEnabled !== false && (
                   <div class="block-divider" style={{ height: `${store.themeConfig.blockDividerWidth ?? 1}px`, background: store.themeConfig.blockDividerColor ?? 'rgba(0,0,0,0.06)' }} />
                 )}
               </div>
             )
          }

          // Skills 特殊处理：作为整体渲染，而不是列表
          if (key === 'skills') {
             if (!Array.isArray(data) || data.length === 0) return null
             return (
               <div 
                 class={['a4-block', store.activeModuleId === 'skills' && 'is-active']}
               style={{ 
                 padding: `${store.themeConfig.blockPadding ?? 16}px`, 
                 marginBottom: `${store.themeConfig.blockGap ?? 12}px`
               }}
                 onClick={(e) => { e.stopPropagation(); onSelect('skills', 'skills') }}
               >
                 {registry['skills']?.({ text: data.join(' / '), detail: data }) || null}
                  {store.themeConfig.blockDividerEnabled !== false && (
                    <div class="block-divider" style={{ height: `${store.themeConfig.blockDividerWidth ?? 1}px`, background: store.themeConfig.blockDividerColor ?? 'rgba(0,0,0,0.06)' }} />
                  )}
                 {store.activeModuleId === 'skills' && (
                    <div class="a4-block-controls" onClick={(e) => e.stopPropagation()}>
                      <div class="ctrl-btn delete" onClick={() => store.updateModuleData('skills', [])}>🗑️</div>
                    </div>
                 )}
               </div>
             )
          }

          // 如果是数组类型（教育、经历等），渲染整个列表
          if (Array.isArray(data)) {
             // 简单的映射：key -> type
             // educations -> education, experiences -> work, projects -> project
             const typeMap: Record<string, string> = {
               educations: 'education',
               experiences: 'work',
               projects: 'project',
               customModules: 'custom'
             }
             const itemType = typeMap[key] || key
             
             if (data.length === 0) return null

             return (
               <div class="module-group" key={key}>
                 {data.map((item: any) => (
                   <div 
                     class={['a4-block', store.activeModuleId === item.id && 'is-active']}
                   style={{ 
                     padding: `${store.themeConfig.blockPadding ?? 16}px`, 
                     marginBottom: `${store.themeConfig.blockGap ?? 12}px`
                   }}
                     onClick={(e) => { e.stopPropagation(); onSelect(item.id, itemType) }}
                   >
                     {registry[itemType]?.(item) || null}
                     {store.themeConfig.blockDividerEnabled !== false && (
                       <div class="block-divider" style={{ height: `${store.themeConfig.blockDividerWidth ?? 1}px`, background: store.themeConfig.blockDividerColor ?? 'rgba(0,0,0,0.06)' }} />
                     )}
                     {store.activeModuleId === item.id && (
                        <div class="a4-block-controls" onClick={(e) => e.stopPropagation()}>
                          <div class="ctrl-btn delete" onClick={() => store.removeListItem(key as any, item.id)}>🗑️</div>
                          <div class="ctrl-btn" onClick={() => store.moveListItem(key as any, item.id, 'up')}>↑</div>
                          <div class="ctrl-btn" onClick={() => store.moveListItem(key as any, item.id, 'down')}>↓</div>
                        </div>
                     )}
                   </div>
                 ))}
               </div>
             )
          }
        })}
      </div>
    )
  }
})
