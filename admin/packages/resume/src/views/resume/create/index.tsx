import './index.scss'
import { defineComponent, onMounted, ref, computed } from 'vue'
import { ROUTE_META_PURE } from '@pkg/core'
import Center from './components/center'
import Left from './components/left'
import Right from './components/right'
import { useResumeStore } from '@pkg/resume'
import { useRoute, useRouter } from 'vue-router'
import { $resumeDetail, $resumeCreate, $resumeUpdate, useUserStore } from '@pkg/core'
import { Button, Input, message } from '@pkg/ui'
import { toPng } from 'html-to-image'
import { PDFDocument } from 'pdf-lib'

export default defineComponent({
  name: 'resume-create-page',
  setup() {
    const store = useResumeStore()
    const route = useRoute()
    const router = useRouter()
    const id = String(route.query.id || '')
    const title = ref('未命名简历')
    const saving = ref(false)
    const qualityModal = ref(false)
    const quality = ref<'low'|'normal'|'high'>('normal')
    onMounted(async () => {
      if (id) {
        const res: any = await $resumeDetail(id)
        const payload = res?.data?.data
        store.fromJSON(payload || '{}')
        store.setResumeId(String(res?.data?.id || id))
        title.value = res?.data?.title || title.value
      }
    })
    const onSave = async () => {
      saving.value = true
      try {
        const uid = String(useUserStore().userInfo?.id || '')
        const payload = { userId: uid, data: store.toObject(), img: '', title: title.value }
        if (store.resumeId) {
          await $resumeUpdate(store.resumeId, payload as any)
          message.success('已保存修改')
        } else {
          const res: any = await $resumeCreate(payload as any)
          if (res?.data?.id) store.setResumeId(String(res.data.id))
          message.success('已创建并保存')
        }
      } catch (e: any) {
        message.error(e?.message || '保存失败')
      } finally {
        saving.value = false
      }
    }
    const onNew = async () => {
      try {
        const uid = String(useUserStore().userInfo?.id || '')
        const payload = { userId: uid, data: store.toObject(), img: '', title: title.value }
        const res: any = await $resumeCreate(payload as any)
        const newId = String(res?.data?.id || '')
        if (newId) {
          store.setResumeId(newId)
          await router.replace({ query: { id: newId } })
          message.success('已创建新简历')
        }
      } catch (e: any) {
        message.error(e?.message || '新建失败')
      }
    }
    const onExportPdf = () => {
      qualityModal.value = true
    }
    const confirmExport = async () => {
      qualityModal.value = false
      store.setActiveModule(null, null)
      const node = document.querySelector('.a4-page') as HTMLElement
      if (!node) return
      const pixelRatio = quality.value === 'high' ? 3 : quality.value === 'low' ? 1.5 : 2
      const dataUrl = await toPng(node, { cacheBust: true, pixelRatio, style: { boxShadow: 'none', margin: '0' } })
      const pngBytes = await fetch(dataUrl).then(r => r.arrayBuffer())
      const pdf = await PDFDocument.create()
      const img = await pdf.embedPng(pngBytes)
      const wPx = node.offsetWidth
      const hPx = node.offsetHeight
      const scale = quality.value === 'high' ? 1.25 : quality.value === 'low' ? 0.95 : 1
      const wPt = wPx * 0.75 * scale
      const hPt = hPx * 0.75 * scale
      const page = pdf.addPage([wPt, hPt])
      page.drawImage(img, { x: 0, y: 0, width: wPt, height: hPt })
      const bytes = await pdf.save()
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title.value || 'resume'}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    }
    const inNewMode = computed(() => !route.query.id)
    return () => (
      <div class="resume-create-page">
        <div class="resume-create-page__header">
          <div class="title-input">
            <Input hideDetails placeholder="请输入标题" modelValue={title.value} onUpdate:modelValue={(v: any) => (title.value = v)} />
          </div>
          {inNewMode.value && <Button variant="text" onClick={onNew}>新建</Button>}
          <Button variant="text" onClick={onExportPdf}>导出PDF</Button>
          {!inNewMode.value && <Button color="primary" loading={saving.value} onClick={onSave}>保存</Button>}
        </div>
        {qualityModal.value && (
          <div class="pdf-modal">
            <div class="modal-card">
              <div class="modal-title">选择导出质量</div>
              <div class="modal-body">
                <label class="radio"><input type="radio" name="quality" checked={quality.value==='low'} onChange={() => (quality.value='low')} /> 低</label>
                <label class="radio"><input type="radio" name="quality" checked={quality.value==='normal'} onChange={() => (quality.value='normal')} /> 普通</label>
                <label class="radio"><input type="radio" name="quality" checked={quality.value==='high'} onChange={() => (quality.value='high')} /> 高</label>
              </div>
              <div class="modal-actions">
                <Button variant="text" onClick={() => (qualityModal.value=false)}>取消</Button>
                <Button color="primary" onClick={confirmExport}>确定</Button>
              </div>
            </div>
          </div>
        )}
        <Left />
        <Center />
        <Right />
      </div>
    )
  }
})

export const routeMeta = {
  title: '新建简历',
  hideInMenu: true,
  [ROUTE_META_PURE]: true,
  order: 2
}
