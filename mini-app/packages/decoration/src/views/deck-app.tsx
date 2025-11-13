import useEditorStore from '../stores/editor'
import { defineAsyncComponent, defineComponent } from 'vue'
import LaunchViewVue from './LaunchView.vue'
import { useRoute } from 'vue-router'

const Editor = defineAsyncComponent({
  loader: () => import('./editor'),
  loadingComponent: <LaunchViewVue key="LaunchViewVue" />
})

export default defineComponent({
  name: 'DeckApp',
  props: {
    pageId: {
      type: String
    }
  },
  setup(props) {
    const route = useRoute()
    const pageId = props.pageId ?? route.params.id ?? route.query.id
    const editorStore = useEditorStore()
    editorStore.setCurrentCanvas(pageId as string)
    console.log(`pageId：`, pageId)
    return () => {
      return (
        <div>
          <Editor />
          {(editorStore.loading || editorStore.failed) && <LaunchViewVue key="LaunchViewVue" />}
        </div>
      )
    }
  }
})
