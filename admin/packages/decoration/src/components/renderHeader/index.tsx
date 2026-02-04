// 装修模式下的头部区域
import { defineComponent } from 'vue'
import { Button } from '@pkg/ui'
import { useRoute } from 'vue-router'
import DeviceToolbar from '../device-toolbar'
import { openPublishModal } from '../decorationPage/new/modal'

export default defineComponent({
  name: 'RenderHeader',
  props: {},
  emits: [''],
  setup(props, { emit }) {
    const route = useRoute()

    const isDecorationPage = () => route.path.startsWith('/decoration')

    return () => (
      <div class="decoration-render-header flex items-center gap-3 w-full">
        {isDecorationPage() && <DeviceToolbar/>}
        {isDecorationPage() && (
          <Button type="primary" onClick={() => openPublishModal()}>发布</Button>
        )}
      </div>
    )
  }
})
