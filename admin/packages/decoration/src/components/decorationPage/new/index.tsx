// 自定义装修页面的新建/编辑
import './style.scss'
import { defineComponent } from 'vue'
import { useDecorationStore } from '../../../store'
import Left from './components/Left'
import Center from './components/Center'
import Right from './components/Right'
import { useRoute } from 'vue-router'
import { $getDecorationPageDetail } from '../../../api/decoration'
import { message, Spin } from '@pkg/ui'
import { ref } from 'vue'
import useEditorStore from '../../../stores/editor'
import useSnapshotStore from '../../../stores/snapshot'

export default defineComponent({
  name: 'DecorationNewPage',
  setup() {
    const store = useDecorationStore()
    const route = useRoute()
    const isLoading = ref(false)
    const editorStore = useEditorStore()
    // 进入页面先清理一次，避免旧状态残留
    store.reset()
    store.loadAll()
    // 标记为自定义页面装修
    store.setPageKind('custom')

    // 若存在 id，则认为是编辑态，拉取详情并回显
    const id = (route.query?.id as string) || store.currentPageId
    // 设置当前画布 key，保证后续 useCanvasStore 可正常使用
    // 设置当前画布：有 id 则指向该页面，无 id 则为新建态
    editorStore.setCurrentCanvas(id as any)
  if (id) {
    store.setCurrentPageId(id)
    isLoading.value = true
    $getDecorationPageDetail(id)
      .then(async (res: any) => {
        const ok = res?.success || res?.code === 200
        if (!ok) return message.error(res?.msg || '获取页面详情失败')
        const data = res?.data || {}
        const decorate = data?.decorate
        // 设置当前页面的元信息（用于发布弹窗回显标题等）
        store.setCurrentPageMeta({ title: data?.title, description: data?.description, name: data?.name })
        await store.applyDecoratePayload(decorate)
        // 将回显的数据同步到画布（Canvas）组件列表
        try {
          const snapshot = decorate?.payload ? decorate : { payload: store.buildDecoratePayload() }
          await useSnapshotStore().retrieveSnapshot(snapshot as any)
        } catch (e) {
          // 同步失败不影响页面回显，仅在控制台提示
          console.warn('[decoration] 同步 Canvas 组件列表失败：', e)
        }
      })
      .catch((err: any) => {
        message.error(err?.message || '获取页面详情失败')
      })
      .finally(() => {
        isLoading.value = false
      })
  }

    return () => (
      <div class="decoration-new-page">
        <Left/>
        <Center/>
        <Right/>
        {isLoading.value && (
          <div class="loading-mask">
            <div class="c_spin" aria-label="loading">
              <div class="c_wave"/>
              <div class="c_wave__dot"/>
            </div>
          </div>
        )}
      </div>
    )
  }
})
