import './index.scss'
import { defineComponent, computed } from 'vue'
import { Button, Input, Textarea, Select, InputNumber, Slider, Switch, ColorPicker, UploadImage } from '@pkg/ui'
import { useResumeStore } from '@pkg/resume'
import { requestUploadFile } from '@pkg/core'

export default defineComponent({
  name: 'resume-right',
  setup() {
    const store = useResumeStore()

    // 获取当前选中的数据
    const currentData = computed(() => {
      const { activeModuleId, activeModuleType, content } = store
      if (!activeModuleId) return null
      
      if (activeModuleType === 'style') {
        return { pagePadding: store.themeConfig.pagePadding }
      }
      
      if (activeModuleId === 'profile') return content.profile
      if (activeModuleId === 'skills') return { detail: content.skills.join('\n') } // 特殊处理技能列表

      // 列表型数据
      const listMap: Record<string, keyof typeof content> = {
        education: 'educations',
        work: 'experiences',
        project: 'projects',
        custom: 'customModules'
      }
      const listKey = listMap[activeModuleType || '']
      if (listKey && Array.isArray(content[listKey])) {
        return (content[listKey] as any[]).find(item => item.id === activeModuleId)
      }
      return null
    })

    // 更新字段通用方法
    const update = (key: string, val: any) => {
      const { activeModuleId, activeModuleType } = store
      if (!activeModuleId) return

      if (activeModuleId === 'profile') {
        store.updateModuleData('profile', { [key]: val })
        return
      }

      if (activeModuleType === 'style') {
        store.updateTheme({ [key]: val })
        return
      }

      if (activeModuleId === 'skills') {
         // 技能特殊处理：字符串换行分割
         if (key === 'detail') {
           const skills = (val || '').split('\n').filter((s: string) => s.trim())
           store.updateModuleData('skills', skills)
         }
         return
      }

      const listMap: Record<string, any> = {
        education: 'educations',
        work: 'experiences',
        project: 'projects'
      }
      const listKey = listMap[activeModuleType || '']
      if (listKey) {
        store.updateListItem(listKey, activeModuleId, { [key]: val })
      }
    }

    return () => (
      <div class="resume-right">
        {!currentData.value && <div class="panel-empty">请选择组件进行编辑</div>}
        
        {currentData.value && (
          <div class="panel">
            {/* 基本信息表单 */}
            {store.activeModuleType === 'profile' && (
              <div class="field-group">
                <div class="field-block"><div class="field-label">姓名</div><Input value={currentData.value.name} onUpdate:modelValue={(v: any) => update('name', v)} /></div>
                <div class="field-block"><div class="field-label">职位/头衔</div><Input value={currentData.value.title} onUpdate:modelValue={(v: any) => update('title', v)} /></div>
                <div class="field-block"><div class="field-label">电话</div><Input value={currentData.value.phone} onUpdate:modelValue={(v: any) => update('phone', v)} /></div>
                <div class="field-block"><div class="field-label">邮箱</div><Input value={currentData.value.email} onUpdate:modelValue={(v: any) => update('email', v)} /></div>
                <div class="field-block"><div class="field-label">头像</div>
                  <UploadImage 
                    value={currentData.value.avatar} 
                    size={90}
                    onUpload={async (file: File) => {
                      const res: any = await requestUploadFile(file)
                      return res?.data?.url || ''
                    }}
                    onUpdate:value={(url: string) => update('avatar', url)}
                  />
                </div>
              </div>
            )}

            {/* 个人总结表单（独立） */}
            {store.activeModuleType === 'summary' && (
              <div class="field-group">
                <div class="field-block"><div class="field-label">个人简介</div><Textarea rows={6} value={store.content.profile.summary} onUpdate:value={(v: any) => update('summary', v)} /></div>
              </div>
            )}

            {/* 页面样式配置 */}
            {store.activeModuleType === 'style' && (
              <div class="field-group">
                <div class="field-block">
                  <div class="field-label">页面内边距 (px)</div>
                  <InputNumber min={0} max={96} value={store.themeConfig.pagePadding ?? 24} onUpdate:value={(v: any) => update('pagePadding', Number(v) || 0)} />
                </div>
                <div class="field-block">
                  <div class="field-label">模块内边距 (px)</div>
                  <InputNumber min={0} max={96} value={store.themeConfig.blockPadding ?? 16} onUpdate:value={(v: any) => update('blockPadding', Number(v) || 0)} />
                </div>
                <div class="field-block">
                  <div class="field-label">卡片间距 (px)</div>
                  <InputNumber min={0} max={64} value={store.themeConfig.blockGap ?? 12} onUpdate:value={(v: any) => update('blockGap', Number(v) || 0)} />
                </div>
                <div class="field-block">
                  <div class="field-label">显示分隔线</div>
                  <div style={{ width: '48px' }}>
                    <Switch checked={store.themeConfig.blockDividerEnabled !== false} onClick={() => update('blockDividerEnabled', !(store.themeConfig.blockDividerEnabled !== false))} />
                  </div>
                </div>
                {store.themeConfig.blockDividerEnabled !== false && (
                  <>
                    <div class="field-block">
                      <div class="field-label">分隔线粗细 (px)</div>
                      <InputNumber min={0} max={6} value={store.themeConfig.blockDividerWidth ?? 1} onUpdate:value={(v: any) => update('blockDividerWidth', Number(v) || 0)} />
                    </div>
                    <div class="field-block">
                      <div class="field-label">分隔线颜色</div>
                      <ColorPicker modelValue={store.themeConfig.blockDividerColor ?? 'rgba(0,0,0,0.06)'} alphaLabel="透明度" showAlpha onUpdate:modelValue={(v: any) => update('blockDividerColor', v)} />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 教育经历表单 */}
            {store.activeModuleType === 'education' && (
               <div class="field-group">
                 <div class="field-block"><div class="field-label">学校名称</div><Input value={currentData.value.school} onUpdate:modelValue={(v: any) => update('school', v)} /></div>
                 <div class="field-block"><div class="field-label">专业</div><Input value={currentData.value.major} onUpdate:modelValue={(v: any) => update('major', v)} /></div>
                 <div class="flex gap-2">
                    <div class="field-block" style={{flex:1}}><div class="field-label">学历</div><Input value={currentData.value.degree} onUpdate:modelValue={(v: any) => update('degree', v)} /></div>
                 </div>
                 <div class="flex gap-2">
                    <div class="field-block" style={{flex:1}}><div class="field-label">开始时间</div><Input value={currentData.value.startDate} onUpdate:modelValue={(v: any) => update('startDate', v)} /></div>
                    <div class="field-block" style={{flex:1}}><div class="field-label">结束时间</div><Input value={currentData.value.endDate} onUpdate:modelValue={(v: any) => update('endDate', v)} /></div>
                 </div>
                 <div class="field-block"><div class="field-label">描述</div><Textarea rows={6} value={currentData.value.description} onUpdate:modelValue={(v: any) => update('description', v)} /></div>
               </div>
            )}

            {/* 工作经历表单 */}
            {store.activeModuleType === 'work' && (
               <div class="field-group">
                 <div class="field-block"><div class="field-label">公司名称</div><Input value={currentData.value.company} onUpdate:modelValue={(v: any) => update('company', v)} /></div>
                 <div class="field-block"><div class="field-label">职位</div><Input value={currentData.value.position} onUpdate:modelValue={(v: any) => update('position', v)} /></div>
                 <div class="flex gap-2">
                    <div class="field-block" style={{flex:1}}><div class="field-label">开始时间</div><Input value={currentData.value.startDate} onUpdate:modelValue={(v: any) => update('startDate', v)} /></div>
                    <div class="field-block" style={{flex:1}}><div class="field-label">结束时间</div><Input value={currentData.value.endDate} onUpdate:modelValue={(v: any) => update('endDate', v)} /></div>
                 </div>
                 <div class="field-block"><div class="field-label">工作内容</div><Textarea rows={8} value={currentData.value.description} onUpdate:modelValue={(v: any) => update('description', v)} /></div>
               </div>
            )}

            {/* 项目经历表单 */}
            {store.activeModuleType === 'project' && (
               <div class="field-group">
                 <div class="field-block"><div class="field-label">项目名称</div><Input value={currentData.value.name} onUpdate:modelValue={(v: any) => update('name', v)} /></div>
                 <div class="field-block"><div class="field-label">担任角色</div><Input value={currentData.value.role} onUpdate:modelValue={(v: any) => update('role', v)} /></div>
                 <div class="flex gap-2">
                    <div class="field-block" style={{flex:1}}><div class="field-label">开始时间</div><Input value={currentData.value.startDate} onUpdate:modelValue={(v: any) => update('startDate', v)} /></div>
                    <div class="field-block" style={{flex:1}}><div class="field-label">结束时间</div><Input value={currentData.value.endDate} onUpdate:modelValue={(v: any) => update('endDate', v)} /></div>
                 </div>
                 <div class="field-block"><div class="field-label">项目描述</div><Textarea rows={8} value={currentData.value.description} onUpdate:modelValue={(v: any) => update('description', v)} /></div>
               </div>
            )}

            {/* 技能表单 (简化版) */}
            {store.activeModuleType === 'skills' && (
               <div class="field-group">
                <div class="field-block"><div class="field-label">技能列表 (每行一个)</div><Textarea rows={10} value={currentData.value.detail} onUpdate:value={(v: any) => update('detail', v)} /></div>
                 <div class="panel-actions"><Button variant="text" onClick={() => store.updateModuleData('skills', [])}>清空技能</Button></div>
               </div>
            )}

          </div>
        )}
      </div>
    )
  }
})
