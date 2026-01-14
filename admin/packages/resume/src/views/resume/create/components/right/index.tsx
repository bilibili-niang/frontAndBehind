import './index.scss'
import { defineComponent } from 'vue'
import { Button, Input, Textarea, Select } from '@pkg/ui'
import { useResumeStore } from '@pkg/resume'
import { $resumeCreate, $resumeUpdate, useUserStore, requestUploadFile } from '@pkg/core'

export default defineComponent({
  name: 'resume-right',
  setup() {
    const store = useResumeStore()
    const update = (key: string, val: any) => {
      if (!store.selected) return
      store.update(store.selected.id, { [key]: val })
    }
    const arr = (key: string): any[] => Array.isArray(store.selected?.props?.[key]) ? store.selected!.props[key] : []
    const pushItem = (key: string, v: string) => {
      if (!v) return
      const list = arr(key)
      store.update(store.selected!.id, { [key]: [...list, v] })
    }
    const removeItem = (key: string, i: number) => {
      const list = arr(key)
      list.splice(i, 1)
      store.update(store.selected!.id, { [key]: [...list] })
    }
    const save = async () => {
      const uid = String(useUserStore().userInfo?.id || '')
      const payload = { userId: uid, data: store.toObject(), img: '', title: '未命名简历' }
      if (store.resumeId) {
        await $resumeUpdate(store.resumeId, payload as any)
      } else {
        const res: any = await $resumeCreate(payload as any)
        if (res?.data?.id) store.setResumeId(String(res.data.id))
      }
    }
    return () => (
      <div class="resume-right">
        {!store.selected && <div class="panel-empty">请选择组件</div>}
        {store.selected && (
          <div class="panel">
            {store.selected.type === 'basic-info' && (
              <div class="field-group">
                <div class="field-block">
                  <div class="field-label">姓名</div>
                  <Input placeholder="" value={store.selected.props?.name || ''} onUpdate:modelValue={(v: any) => update('name', v)} />
                </div>
                <div class="flex gap-2">
                  <div class="field-block" style={{flex:1}}>
                    <div class="field-label">电话</div>
                    <Input placeholder="" value={store.selected.props?.phone || ''} onUpdate:modelValue={(v: any) => update('phone', v)} />
                  </div>
                  <div class="field-block" style={{flex:1}}>
                    <div class="field-label">邮箱</div>
                    <Input placeholder="" value={store.selected.props?.email || ''} onUpdate:modelValue={(v: any) => update('email', v)} />
                  </div>
                </div>
                <div class="flex gap-2">
                  <div class="field-block" style={{flex:1}}>
                    <div class="field-label">现居地</div>
                    <Input placeholder="" value={store.selected.props?.city || ''} onUpdate:modelValue={(v: any) => update('city', v)} />
                  </div>
                  <div class="field-block" style={{flex:1}}>
                    <div class="field-label">个人网站</div>
                    <Input placeholder="" value={store.selected.props?.site || ''} onUpdate:modelValue={(v: any) => update('site', v)} />
                  </div>
                </div>
                <div class="flex gap-2">
                  <div class="field-block" style={{flex:1}}>
                    <div class="field-label">微信</div>
                    <Input placeholder="" value={store.selected.props?.wechat || ''} onUpdate:modelValue={(v: any) => update('wechat', v)} />
                  </div>
                  <div class="field-block" style={{flex:1}}>
                    <div class="field-label">性别</div>
                    <Select value={store.selected.props?.gender || '男'} options={[{label:'男',value:'男'},{label:'女',value:'女'}]} onChange={(v: any) => update('gender', v)} />
                  </div>
                </div>
                <div class="flex gap-2">
                  <div class="field-block" style={{flex:1}}>
                    <div class="field-label">当前状态</div>
                    <Input placeholder="" value={store.selected.props?.status || ''} onUpdate:modelValue={(v: any) => update('status', v)} />
                  </div>
                  <div class="field-block" style={{flex:1}}>
                    <div class="field-label">意向城市</div>
                    <Input placeholder="" value={store.selected.props?.intentCity || ''} onUpdate:modelValue={(v: any) => update('intentCity', v)} />
                  </div>
                </div>
                <div class="field-block">
                  <div class="field-label">期望职位</div>
                  <Input placeholder="" value={store.selected.props?.intentJob || ''} onUpdate:modelValue={(v: any) => update('intentJob', v)} />
                </div>
                <div class="flex gap-2">
                  <div class="field-block" style={{flex:1}}>
                    <div class="field-label">期望薪资(起)</div>
                    <Select value={store.selected.props?.salaryMin || '3k'} options={[{label:'3k',value:'3k'},{label:'5k',value:'5k'},{label:'8k',value:'8k'},{label:'10k',value:'10k'}]} onChange={(v: any) => update('salaryMin', v)} />
                  </div>
                  <div class="field-block" style={{flex:1}}>
                    <div class="field-label">至</div>
                    <Select value={store.selected.props?.salaryMax || '5k'} options={[{label:'5k',value:'5k'},{label:'8k',value:'8k'},{label:'12k',value:'12k'},{label:'15k',value:'15k'}]} onChange={(v: any) => update('salaryMax', v)} />
                  </div>
                </div>
                <div class="field-block">
                  <div class="field-label">LinkedIn</div>
                  <Input placeholder="" value={store.selected.props?.linkedin || ''} onUpdate:modelValue={(v: any) => update('linkedin', v)} />
                </div>
                <div class="field-block">
                  <div class="field-label">头像</div>
                  <div class="flex gap-2">
                    <div class="avatar-upload">
                      <div class="preview" style={{width:'80px',height:'80px',border:'1px solid var(--color-border-base)'}}> {store.selected.props?.avatarUrl && (<img src={store.selected.props.avatarUrl} style={{width:'100%',height:'100%',objectFit:'cover'}}/>)} </div>
                      <input type="file" accept="image/*" onChange={async (e: any) => {
                        const file = e?.target?.files?.[0]
                        if (!file) return
                        const res: any = await requestUploadFile(file)
                        const url = res?.data?.url || ''
                        if (url) update('avatarUrl', url)
                      }}/>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {store.selected.type === 'education' && (
              <div class="field-group">
                <div class="field-block"><div class="field-label">学校名称</div><Input value={store.selected.props?.schoolName || ''} onUpdate:modelValue={(v: any) => update('schoolName', v)} /></div>
                <div class="flex gap-2">
                  <div class="field-block" style={{flex:1}}><div class="field-label">校徽</div>
                    <div class="avatar-upload">
                      <div class="preview" style={{width:'80px',height:'80px',border:'1px solid var(--color-border-base)'}}> {store.selected.props?.badgeUrl && (<img src={store.selected.props.badgeUrl} style={{width:'100%',height:'100%',objectFit:'cover'}}/>)} </div>
                      <input type="file" accept="image/*" onChange={async (e: any) => {const f=e.target.files?.[0]; if(!f) return; const r:any=await requestUploadFile(f); const url=r?.data?.url||''; if(url) update('badgeUrl', url)}}/>
                    </div>
                  </div>
                  <div class="field-block" style={{flex:1}}><div class="field-label">标签</div>
                    <div class="flex gap-2">
                      <Input placeholder="输入后回车添加" onKeyup={(e: any) => { if(e.key==='Enter'){ pushItem('tags', (e.target.value||'').trim()); e.target.value=''}}} />
                    </div>
                    <div class="flex gap-2" style={{flexWrap:'wrap'}}>
                      {arr('tags').map((t, i) => (<Button variant="text" onClick={() => removeItem('tags', i)}>{t}</Button>))}
                    </div>
                  </div>
                </div>
                <div class="flex gap-2">
                  <div class="field-block" style={{flex:1}}><div class="field-label">专业</div><Input value={store.selected.props?.major || ''} onUpdate:modelValue={(v: any) => update('major', v)} /></div>
                  <div class="field-block" style={{flex:1}}><div class="field-label">学历</div><Select value={store.selected.props?.degree || '本科'} options={[{label:'专科',value:'专科'},{label:'本科',value:'本科'},{label:'硕士',value:'硕士'},{label:'博士',value:'博士'}]} onChange={(v: any) => update('degree', v)} /></div>
                  <div class="field-block" style={{flex:1}}><div class="field-label">学制</div><Select value={store.selected.props?.studyType || '全日制'} options={[{label:'全日制',value:'全日制'},{label:'非全日制',value:'非全日制'}]} onChange={(v: any) => update('studyType', v)} /></div>
                </div>
                <div class="flex gap-2">
                  <div class="field-block" style={{flex:1}}><div class="field-label">学院</div><Input value={store.selected.props?.college || ''} onUpdate:modelValue={(v: any) => update('college', v)} /></div>
                  <div class="field-block" style={{flex:1}}><div class="field-label">所在城市</div><Input value={store.selected.props?.city || ''} onUpdate:modelValue={(v: any) => update('city', v)} /></div>
                </div>
                <div class="flex gap-2">
                  <div class="field-block" style={{flex:1}}><div class="field-label">开始时间</div><Input value={store.selected.props?.startDate || ''} onUpdate:modelValue={(v: any) => update('startDate', v)} /></div>
                  <div class="field-block" style={{flex:1}}><div class="field-label">结束时间</div><Input value={store.selected.props?.endDate || ''} onUpdate:modelValue={(v: any) => update('endDate', v)} /></div>
                </div>
                <div class="field-block"><div class="field-label">详情</div><Textarea rows={6} value={store.selected.props?.detail || ''} onUpdate:modelValue={(v: any) => update('detail', v)} /></div>
              </div>
            )}
            {store.selected.type === 'work' && (
              <div class="field-group">
                <div class="field-block"><div class="field-label">经历名称/公司</div><Input value={store.selected.props?.company || ''} onUpdate:modelValue={(v: any) => update('company', v)} /></div>
                <div class="flex gap-2">
                  <div class="field-block" style={{flex:1}}><div class="field-label">角色/职位</div><Input value={store.selected.props?.role || ''} onUpdate:modelValue={(v: any) => update('role', v)} /></div>
                  <div class="field-block" style={{flex:1}}><div class="field-label">部门</div><Input value={store.selected.props?.department || ''} onUpdate:modelValue={(v: any) => update('department', v)} /></div>
                  <div class="field-block" style={{flex:1}}><div class="field-label">城市</div><Input value={store.selected.props?.city || ''} onUpdate:modelValue={(v: any) => update('city', v)} /></div>
                </div>
                <div class="flex gap-2">
                  <div class="field-block" style={{flex:1}}><div class="field-label">开始时间</div><Input value={store.selected.props?.startDate || ''} onUpdate:modelValue={(v: any) => update('startDate', v)} /></div>
                  <div class="field-block" style={{flex:1}}><div class="field-label">结束时间</div><Input value={store.selected.props?.endDate || ''} onUpdate:modelValue={(v: any) => update('endDate', v)} /></div>
                </div>
                <div class="field-block"><div class="field-label">技术栈标签</div>
                  <Input placeholder="输入后回车添加" onKeyup={(e: any) => { if(e.key==='Enter'){ pushItem('techStack', (e.target.value||'').trim()); e.target.value=''}}} />
                  <div class="flex gap-2" style={{flexWrap:'wrap'}}>{arr('techStack').map((t,i)=>(<Button variant="text" onClick={()=>removeItem('techStack',i)}>{t}</Button>))}</div>
                </div>
                <div class="field-block"><div class="field-label">职责/成果</div><Textarea rows={8} value={store.selected.props?.detail || ''} onUpdate:modelValue={(v: any) => update('detail', v)} /></div>
              </div>
            )}
            {store.selected.type === 'project' && (
              <div class="field-group">
                <div class="field-block"><div class="field-label">项目名称</div><Input value={store.selected.props?.name || ''} onUpdate:modelValue={(v: any) => update('name', v)} /></div>
                <div class="flex gap-2">
                  <div class="field-block" style={{flex:1}}><div class="field-label">你的角色</div><Input value={store.selected.props?.role || ''} onUpdate:modelValue={(v: any) => update('role', v)} /></div>
                  <div class="field-block" style={{flex:1}}><div class="field-label">开始时间</div><Input value={store.selected.props?.startDate || ''} onUpdate:modelValue={(v: any) => update('startDate', v)} /></div>
                  <div class="field-block" style={{flex:1}}><div class="field-label">结束时间</div><Input value={store.selected.props?.endDate || ''} onUpdate:modelValue={(v: any) => update('endDate', v)} /></div>
                </div>
                <div class="field-block"><div class="field-label">技术栈标签</div>
                  <Input placeholder="输入后回车添加" onKeyup={(e: any) => { if(e.key==='Enter'){ pushItem('techStack', (e.target.value||'').trim()); e.target.value=''}}} />
                  <div class="flex gap-2" style={{flexWrap:'wrap'}}>{arr('techStack').map((t,i)=>(<Button variant="text" onClick={()=>removeItem('techStack',i)}>{t}</Button>))}</div>
                </div>
                <div class="field-block"><div class="field-label">项目链接</div><Input value={store.selected.props?.link || ''} onUpdate:modelValue={(v: any) => update('link', v)} /></div>
                <div class="field-block"><div class="field-label">项目简介/职责</div><Textarea rows={8} value={store.selected.props?.detail || ''} onUpdate:modelValue={(v: any) => update('detail', v)} /></div>
                <div class="field-block"><div class="field-label">截图</div>
                  <input type="file" multiple accept="image/*" onChange={async (e: any) => {
                    const files: File[] = Array.from(e?.target?.files || [])
                    const urls: string[] = []
                    for (const f of files) { const r:any = await requestUploadFile(f); const u = r?.data?.url || ''; if (u) urls.push(u) }
                    const prev = arr('images')
                    store.update(store.selected!.id, { images: [...prev, ...urls] })
                  }}/>
                  <div class="flex gap-2" style={{flexWrap:'wrap'}}>{arr('images').map((u,i)=>(<div style={{width:'80px',height:'80px',border:'1px solid var(--color-border-base)'}}><img src={u} style={{width:'100%',height:'100%',objectFit:'cover'}}/></div>))}</div>
                </div>
              </div>
            )}
            {store.selected.type === 'skills' && (
              <div class="field-group">
                <div class="field-block"><div class="field-label">技能条目</div><Textarea rows={8} value={store.selected.props?.detail || ''} onUpdate:modelValue={(v: any) => update('detail', v)} /></div>
              </div>
            )}
            {store.selected.type === 'award' && (
              <div class="field-group">
                <div class="field-block"><div class="field-label">奖项名称</div><Input value={store.selected.props?.name || ''} onUpdate:modelValue={(v: any) => update('name', v)} /></div>
                <div class="field-block"><div class="field-label">获奖时间</div><Input value={store.selected.props?.date || ''} onUpdate:modelValue={(v: any) => update('date', v)} /></div>
                <div class="flex gap-2">
                  <div class="field-block" style={{flex:1}}><div class="field-label">颁发机构</div><Input value={store.selected.props?.org || ''} onUpdate:modelValue={(v: any) => update('org', v)} /></div>
                  <div class="field-block" style={{flex:1}}><div class="field-label">等级/类别</div><Input value={store.selected.props?.level || ''} onUpdate:modelValue={(v: any) => update('level', v)} /></div>
                </div>
                <div class="field-block"><div class="field-label">描述</div><Textarea rows={6} value={store.selected.props?.detail || ''} onUpdate:modelValue={(v: any) => update('detail', v)} /></div>
                <div class="field-block"><div class="field-label">证书图片</div>
                  <div class="avatar-upload">
                    <div class="preview" style={{width:'120px',height:'80px',border:'1px solid var(--color-border-base)'}}> {store.selected.props?.certificateUrl && (<img src={store.selected.props.certificateUrl} style={{width:'100%',height:'100%',objectFit:'cover'}}/>)} </div>
                    <input type="file" accept="image/*" onChange={async (e: any) => {const f=e.target.files?.[0]; if(!f) return; const r:any=await requestUploadFile(f); const url=r?.data?.url||''; if(url) update('certificateUrl', url)}}/>
                  </div>
                </div>
              </div>
            )}
            {store.selected.type === 'summary' && (
              <Textarea label="摘要" rows={6} value={store.selected.props?.text || ''} onUpdate:modelValue={(v: any) => update('text', v)} />
            )}
            {store.selected.type === 'education' && (
              <Textarea label="内容" rows={6} value={store.selected.props?.text || ''} onUpdate:modelValue={(v: any) => update('text', v)} />
            )}
            {store.selected.type === 'work' && (
              <Textarea label="内容" rows={8} value={store.selected.props?.text || ''} onUpdate:modelValue={(v: any) => update('text', v)} />
            )}
            {store.selected.type === 'project' && (
              <Textarea label="内容" rows={8} value={store.selected.props?.text || ''} onUpdate:modelValue={(v: any) => update('text', v)} />
            )}
            <div class="panel-actions">
              <Button variant="text" onClick={() => store.remove(store.selected!.id)}>删除</Button>
            </div>
          </div>
        )}
      </div>
    )
  }
})