import { computed, defineComponent, onMounted, type PropType } from 'vue'
import { registeredComponents } from '../../../../canvas-components'
import useCanvasStore from '../../../../stores/canvas'

export default defineComponent({
  name: 'CompItem',
  props: {
    manifest: {
      type: Object as PropType<{
        key: string
        name: string
        version: string
        thumbnail?: string
        images: string[]
        type: string
        scope?: string
      }>,
      required: true
    },
    asSelector: {
      type: Boolean,
      default: false
    }
  },
  emits: {
    select: (manifest: any) => true
  },
  setup(props, { emit }) {
    const canvasStore = useCanvasStore()
    const onDragstart = (e: DragEvent) => {
      e.dataTransfer?.setDragImage(document.getElementById('deck-out-screen-drag-tip')!, 0, 0)
      e.dataTransfer?.setData('text', props.manifest.key)
      e.dataTransfer?.setData('deck-component', JSON.stringify(props.manifest))

      document.addEventListener('mouseup', onDragEnd)
      document.addEventListener('dragend', onDragEnd)

      canvasStore.layerTree.draggingNode = {}
    }

    const onDragEnd = () => {
      document.removeEventListener('mouseup', onDragEnd)
      document.removeEventListener('dragend', onDragEnd)
      canvasStore.layerTree.resetMoveState()
    }

    onMounted(() => {
      document.removeEventListener('mouseup', onDragEnd)
      document.removeEventListener('dragend', onDragEnd)
    })

    const scopeRef = computed(() => {
      if (props.manifest.type !== 'scope') return null
      return registeredComponents.value[props.manifest.scope!]?.name
    })

    const thumbnail = props.manifest.thumbnail ?? props.manifest.images?.[0]

    const onClick = () => {
      if (props.asSelector) {
        emit('select', props.manifest)
      }
    }

    return () => {
      return (
        <div
          class={['drag-comp-item moveable', props.asSelector && 'clickable']}
          draggable={!props.asSelector}
          onDragstart={onDragstart}
          onClick={onClick}
        >
          <div class="drag-comp-item__thumbnail">
            {thumbnail && <img src={thumbnail} draggable={false} />}
          </div>
          <div class="drag-comp-item__text">
            <span class="drag-comp-item__name">{props.manifest.name}</span>
            {scopeRef.value && <span class="drag-comp-item__scope">{scopeRef.value}</span>}
          </div>
        </div>
      )
    }
  }
})
