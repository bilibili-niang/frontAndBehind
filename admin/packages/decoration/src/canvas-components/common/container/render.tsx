import { computed, defineComponent, PropType, ref, withModifiers } from 'vue'
import useCanvasStore, { DeckComponent } from '../../../stores/canvas'
import { Empty } from '@pkg/ui'
import { storeToRefs } from 'pinia'
import ComponentItem from '../../../views/editor/canvas/component-item'
import './style.scss'
import { withUnit } from '../../utils'
import { ComponentDefine } from '../../../stores/component'

export { default as manifest } from './manifest'

export default defineComponent({
  name: 'd_container',
  props: {
    comp: {
      type: Object as PropType<DeckComponent>,
      required: true
    },
    config: {
      type: Object as PropType<any>,
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

    const styleRef = computed(() => {
      const linearGradientEnable = props.config?.linearGradientEnable ?? false
      const {
        deg = 180,
        from = 'rgba(255, 0, 0, 0.1)',
        to = 'rgba(255, 255, 255, 0.1)',
        fromStop = 0,
        toStop = 100
      } = props.config?.linearGradient || {}

      const {
        enable: borderEnable = false,
        shape: borderShape = 'solid',
        width: borderWidth = 1,
        color: borderColor = '#000000'
      } = props.config?.border || {}

      return {
        backgroundImage: linearGradientEnable
          ? `linear-gradient(${deg}deg, ${from} ${fromStop}%, ${to} ${toStop}%)`
          : 'none',
        ...(borderEnable
          ? {
            borderWidth: withUnit(borderWidth),
            borderStyle: borderShape,
            borderColor: borderColor
          }
          : {}),
        ...cssVar.value
      }
    })

    const cssVar = computed(() => {
      return {
        '--bubble-offset-left': withUnit(-(props.comp.attrs?.margin?.[3] ?? 0)),
        '--bubble-offset-right': withUnit(props.comp.attrs?.margin?.[1] ?? 0)
      }
    })

    const isDragging = ref(false)
    const onDrop = (e: any) => {
      isDragging.value = false

      const comp = JSON.parse(
        e.dataTransfer?.getData('deck-component')!
      ) as unknown as ComponentDefine

      const lasChild = childComponents.value[childComponents.value.length - 1]

      if (lasChild) {
        canvasStore.addComponent(comp, lasChild.id, 'below')
      } else {
        canvasStore.addComponent(comp, props.comp.id, 'inside')
      }
    }

    const Scope = () => {
      return (
        <div
          class={['d_container__scope', isDragging.value && 'dragging']}
          style={cssVar.value}
          onDragenter={() => {
            isDragging.value = true
          }}
          onDragleave={() => {
            isDragging.value = false
          }}
          onDrop={withModifiers(onDrop, ['stop'])}
        >
          <div class="text">{props.comp.name ?? '基础容器'}</div>
        </div>
      )
    }

    return () => {
      if (childComponents.value.length === 0) {
        return (
          <>
            <div class="d_container-empty">
              <Empty description="该容器无内容，请添加组件"/>
            </div>
            <Scope/>
          </>
        )
      }
      return (
        <>
          <div class="d_container" style={styleRef.value}>
            {childComponents.value.map((item) => (
              <ComponentItem comp={item} config={item.config}/>
            ))}
          </div>
          <Scope/>
        </>
      )
    }
  }
})
