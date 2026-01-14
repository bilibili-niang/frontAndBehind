// 系统页面的装修编辑：复用自定义装修页面的布局与交互
import '../../decorationPage/new/style.scss'
import { defineComponent } from 'vue'
import { useDecorationStore } from '../../../store'
import Left from '../../decorationPage/new/components/Left'
import Center from '../../decorationPage/new/components/Center'
import Right from '../../decorationPage/new/components/Right'
import { useRoute } from 'vue-router'
import { $getSystemPageDetail } from '../../../api'
import { message } from '@pkg/ui'
import useEditorStore from '../../../stores/editor'
import useSnapshotStore from '../../../stores/snapshot'

export default defineComponent({
  name: 'SystemPageDecorate',
  setup() {
    const route = useRoute()

    const init = () => {
      const pageId = route?.params.id ?? route?.query.id
      const editorStore = useEditorStore()
      editorStore.setCurrentCanvas(pageId as string)
    }

    init()

    const store = useDecorationStore()

    // 进入页面先清理一次，避免旧状态残留
    store.reset()
    store.loadAll()
    // 标记为系统页面装修
    store.setPageKind('system')

    // 若存在 id，则认为是编辑态，拉取详情并回显
    const id = (route.query?.id as string) || (route.params?.id as string) || store.currentPageId
    if (id) {
      store.setCurrentPageId(id)
      $getSystemPageDetail(id)
        .then(async (res: any) => {
          const ok = res?.success || res?.code === 200
          if (!ok) return message.error(res?.msg || '获取系统页面详情失败')
          const data = res?.data || {}
          const decorate = data?.decorate
          // 设置当前页面的元信息（用于发布弹窗回显标题等）
          store.setCurrentPageMeta({ title: data?.title, description: data?.description, name: data?.name })
          await store.applyDecoratePayload(decorate)
          // 同步到 Canvas 以填充组件列表
          try {
            const snapshot = decorate?.payload ? decorate : { payload: store.buildDecoratePayload() }
            await useSnapshotStore().retrieveSnapshot(snapshot as any)
          } catch (e) {
            console.warn('[system decorate] 同步 Canvas 组件列表失败：', e)
          }
        })
        .catch((err: any) => {
          message.error(err?.message || '获取系统页面详情失败')
        })
    } else {
      message.error('缺少系统页面ID，无法进入装修')
    }

    return () => (
      <div class="decoration-new-page">
        <Left/>
        <Center/>
        <Right/>
      </div>
    )
  }
})