import { PropType, computed, defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import useCanvasStore, { DeckComponent } from '../../../../stores/canvas'
import { Empty, message, ScrollTab, ScrollTabItem } from '@anteng/ui'
import { findLastIndex } from 'lodash'
import { storeToRefs } from 'pinia'
import ComponentItem from '../../../../views/editor/canvas/component-item'

export { default as manifest } from './manifest'

type Comp = {
  title: string
  icon: string
}

export default defineComponent({
  name: 'd_view-tab',
  props: {
    comp: {
      type: Object as PropType<DeckComponent<Comp>>,
      required: true
    },
    config: {
      type: Object as PropType<Comp>,
      required: true
    }
  },
  setup(props) {
    const canvasStore = useCanvasStore()
    const { layerTree } = storeToRefs(canvasStore)
    const childComponents = computed(() => {
      return (
        layerTree.value
          .getNode(props.comp.id)
          ?.children.map((childNode) => {
            return childNode.$component
          })
          .filter((item) => !item.hidden) ?? []
      )
    })

    return () => {
      if (childComponents.value.length === 0) {
        return (
          <div style="padding: 36px 0 24px 0">
            <Empty description="该分页无内容，请添加组件" />
          </div>
        )
      }
      return childComponents.value.map((item) => {
        return <ComponentItem comp={item} config={item.config} />
      })
    }
  }
})
