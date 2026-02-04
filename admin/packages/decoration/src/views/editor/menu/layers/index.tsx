import { computed, defineComponent } from 'vue'
import './style.scss'
import './style.dark.scss'
import { Empty, message } from '@pkg/ui'
import useCanvasStore from '../../../../stores/canvas'
import type { ComponentDefine } from '../../../../stores/component'
import useComponentStore from '../../../../stores/component'
import { storeToRefs } from 'pinia'
import LayerTree from './layer-tree'
import { checkIsNestable } from '../../../../stores/canvas/nest'

export default defineComponent({
  name: 'DeckEditorMenuLayers',
  setup() {
    const canvasStore = useCanvasStore()
    const { components: rawComponents, layerTree } = storeToRefs(canvasStore)
    const componentStore = useComponentStore()

    const thumbnailMap = computed(() => {
      const obj: { [key: string]: string | undefined } = {}
      componentStore.componentList.forEach((item) => {
        obj[item.key] = item.thumbnail
      })
      return obj
    })

    const components = computed(() => {
      return rawComponents.value.map((item) => {
        return {
          ...item,
          thumbnail: thumbnailMap.value[item.key]
        }
      })
    })

    const onDragover = (e: DragEvent) => {
      e.preventDefault()
    }
    const onDrop = (e: DragEvent) => {
      try {
        const comp = JSON.parse(
          e.dataTransfer?.getData('deck-component')!
        ) as unknown as ComponentDefine

        const hoverNode = canvasStore.layerTree.hoverNode
        const movePosition = canvasStore.layerTree.movePosition

        const insideKey = canvasStore.layerTree.insideNode?.$component?.key

        useComponentStore()
          .loadComponentPackage(comp.key)
          .then(() => {
            if (insideKey && !checkIsNestable(comp.key, insideKey, true)) {
              return void 0
            }
            canvasStore.addComponent(comp, hoverNode?.id, movePosition)
          })
      } catch (err: any) {
        message.error(`添加组件失败${err.message}`)
      }
    }

    return () => {
      return (
        <div class={['component-layers']} onDrop={onDrop} onDragover={onDragover}>
          <div class="component-layers__header">
            <strong>页面图层</strong>
          </div>
          <div class="component-layers__content scroller">
            <LayerTree/>
            {components.value.length === 0 && (
              <Empty style="font-size:12px;margin-top:40px;" description="无图层，请添加组件"/>
            )}
          </div>
        </div>
      )
    }
  }
})
