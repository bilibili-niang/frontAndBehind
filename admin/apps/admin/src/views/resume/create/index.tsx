import './index.scss'
import { defineComponent, reactive } from 'vue'
import { RouteMeta } from '@/router/routeMeta'
import { Button, Input, message } from '@anteng/ui'
import { useRouter } from 'vue-router'
import { $resumeCreate } from '@/api/resume'
import { useAuthStore } from '@/store/auth'
import { ROUTE_META_PURE } from '@anteng/core'

export default defineComponent({
  name: 'resume-create-page',
  setup() {
    const router = useRouter()
    const auth = useAuthStore()

    const form = reactive({
      title: '',
      img: '',
      data: '{\n  "name": "张三",\n  "age": 26\n}'
    })

    const submitting = reactive({ loading: false })

    const handleSubmit = async () => {
      if (!form.title) return message.error('请输入标题')
      let dataStr = form.data
      try { JSON.parse(dataStr) } catch { return message.error('数据必须是合法的 JSON') }

      submitting.loading = true
      try {
        await $resumeCreate({
          userId: auth.userInfo?.id || '',
          title: form.title,
          img: form.img,
          data: dataStr
        })
        message.success('新建成功')
        router.replace('/resume/list')
      } catch (e: any) {
        message.error(e?.message || '新建失败')
      } finally {
        submitting.loading = false
      }
    }

    const handleCancel = () => router.back()

    return () => (
      <div class="resume-create-page">
        <div class="resume-create-page-card">
          <div class="resume-create-page-title">新建简历</div>
          <div class="resume-create-page-form">
            <div class="resume-create-page-form-row">
              <label class="resume-create-page-label">标题</label>
              <Input value={form.title} onChange={(e: any) => (form.title = e.target.value)} placeholder="请输入标题" />
            </div>
            <div class="resume-create-page-form-row">
              <label class="resume-create-page-label">封面图</label>
              <Input value={form.img} onChange={(e: any) => (form.img = e.target.value)} placeholder="请输入图片URL" />
            </div>
            <div class="resume-create-page-form-row">
              <label class="resume-create-page-label">数据(JSON)</label>
              <textarea
                class="resume-create-page-textarea"
                value={form.data as any}
                onChange={(e: any) => (form.data = e.target.value)}
                placeholder="请输入合法的 JSON 字符串"
              />
            </div>
            <div class="resume-create-page-actions">
              <Button type="primary" loading={submitting.loading} onClick={handleSubmit}>提交</Button>
              <Button onClick={handleCancel} style="margin-left:8px;">取消</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
})

export const routeMeta: RouteMeta = {
  title: '新建简历',
  hideInMenu: true,
  // 是否隐藏侧边菜单
  [ROUTE_META_PURE]: true,
  order: 2
}