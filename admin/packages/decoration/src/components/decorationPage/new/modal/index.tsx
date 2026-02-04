import './index.scss'
import { defineComponent, reactive, ref } from 'vue'
import { Button, message, Modal } from '@pkg/ui'
import { type Schema, SchemaForm } from '@pkg/jsf'
import { $createDecorationPage, $updateDecorationPage } from '../../../../api/decoration'
import { $createSystemPage, $updateSystemPage } from '../../../../api/systempage'
import { useDecorationStore } from '../../../../store'
import { SCENE_YESONG } from '@pkg/config'
import { cloneDeep } from 'lodash'
import { router } from '@pkg/core'

type PublishMeta = {
  title: string
  scene: string
  description?: string
}

const metaSchema: Schema = {
  title: '发布页面',
  type: 'object',
  properties: {
    title: { title: '页面名称', type: 'string', widget: 'input', required: true }
    // 只展示“名字”，其它字段使用默认值，不需要用户填写
  }
}

const PublishContent = defineComponent({
  name: 'DecorationPublishContent',
  props: {
    onClose: { type: Function as any, required: true },
    getDecorate: { type: Function as any, required: true },
    isEdit: { type: Boolean, required: true },
    pageId: { type: String as any, required: false },
    onCreated: { type: Function as any, required: false },
    // 页面类型：custom 或 system（用于决定调用的接口）
    kind: { type: String as any, required: true }
  },
  setup(props) {
    const store = useDecorationStore()

    console.log('store.pageValue')
    console.log(store.pageValue)

    const isEdit = !!props.isEdit
    const meta = reactive<PublishMeta>({
      // 编辑态优先使用后端回显的 title；新建态使用页面配置的 basic.name
      title: (isEdit ? store.currentPageMeta?.title : (store.pageValue as any)?.basic?.name) || '自定义页面',
      scene: SCENE_YESONG,
      description: (isEdit ? store.currentPageMeta?.description : '自定义装修页面') || '自定义装修页面'
    })
    const loading = ref(false)

    const onSubmit = async () => {
      loading.value = true
      try {
        // 通过父上下文传入的回调获取最新装修数据，避免弹窗独立上下文导致的空数据
        const decorate = props.getDecorate?.()
        if (isEdit && props.pageId) {
          const isSystem = props.kind === 'system'
          const res = isSystem
            ? await $updateSystemPage(props.pageId, {
                title: meta.title,
                editUser: 'system',
                decorate,
                description: meta.description
              })
            : await $updateDecorationPage(props.pageId, {
                title: meta.title,
                editUser: 'system',
                decorate,
                description: meta.description
              })
          if (res?.success || res?.code === 200) {
            message.success(res?.msg || '保存成功')
            return true
          }
          message.error(res?.msg || '保存失败')
          return false
        } else {
          const isSystem = props.kind === 'system'
          const res = isSystem
            ? await $createSystemPage({
                title: meta.title,
                scene: meta.scene,
                editUser: 'system',
                description: meta.description,
                decorate
              })
            : await $createDecorationPage({
                title: meta.title,
                scene: meta.scene,
                editUser: 'system',
                description: meta.description,
                decorate
              })
          if (res?.success || res?.code === 200) {
            props.onCreated?.(res?.data?.id)
            message.success(res?.msg || '创建成功')
            return true
          }
          message.error(res?.msg || '创建失败')
          return false
        }
      } catch (err: any) {
        message.error(err?.message || '保存失败')
        return false
      } finally {
        loading.value = false
      }
    }

    return () => (
      <div class="publish-modal">
        <SchemaForm schema={metaSchema} value={meta} onChange={() => {
        }} theme="compact"/>
        <div class="flex justify-end gap-2 mt-3">
          <Button onClick={() => props.onClose?.()}>取消</Button>
          <Button type="primary" loading={loading.value} onClick={async () => {
            const ok = await onSubmit()
            if (ok) {
              props.onClose?.()
              // 保存/更新成功后返回上一页面
              router.back()
            }
          }}>{isEdit ? '保存' : '发布'}</Button>
        </div>
      </div>
    )
  }
})

export const openPublishModal = () => {
  const store = useDecorationStore()
  // 在当前页面上下文中构建获取装修数据的回调
  const getDecorate = () => {
    try {
      return store.buildDecoratePayload()
    } catch (e) {
      // 兜底：手动构建，确保 contentPadding 为数组
      const headerValue = cloneDeep(store.header.value?.value || {})
      const headerAttrs = cloneDeep(store.header.value?.attrs || {})
      const components = (store.pageComponents.value || []).map((c) => ({
        key: c.key,
        name: c.name,
        config: cloneDeep(c.value),
        attrs: cloneDeep(c.attrs || {})
      }))
      const pageOut = cloneDeep(store.page.value)
      const cp: any = pageOut?.basic?.contentPadding
      if (cp && typeof cp === 'object' && !Array.isArray(cp)) {
        pageOut.basic.contentPadding = [cp.top || 0, cp.right || 0, cp.bottom || 0, cp.left || 0] as any
      }
      return { page: pageOut, header: { value: headerValue, attrs: headerAttrs }, components }
    }
  }
  // 优先使用 store 中的页面类型，其次回落到路由判断
  const path = router.currentRoute.value?.path || ''
  const kind = (store.pageKind || (path.includes('/decoration/systempage/decorate') ? 'system' : 'custom')) as any
  const modal = Modal.open({
    title: '发布装修页面',
    width: 520,
    centered: true,
    content: (
      <PublishContent
        onClose={() => modal.close()}
        getDecorate={getDecorate}
        isEdit={!!store.currentPageId}
        pageId={store.currentPageId as any}
        onCreated={(id: string) => store.setCurrentPageId(id)}
        kind={kind as any}
      />
    )
  })
}