import { computed, defineComponent, PropType, ref, withModifiers } from 'vue'
import './layer-node.scss'
import { Icon, message } from '@pkg/ui'
import { type FlattenTreeCompNode } from '../../../../stores/canvas/types'
import useCanvasStore from '../../../../stores/canvas'
import { storeToRefs } from 'pinia'
import { clamp } from 'lodash'
import {
  findNodeAndParent,
  getNthParent,
  LayerTreeNode,
  moveNode
} from '../../../../stores/canvas/tree'

const FOLDER_SIZE = 20
const MIN_INDENT = 6

const treeState = ref({
  draggingNode: '',
  hoverNode: '',
  insideNode: '',
  ratio: 0,
  depth: 0
})

const restoreTreeState = () => {
  treeState.value = {
    draggingNode: '',
    hoverNode: '',
    insideNode: '',
    ratio: 0,
    depth: 0
  }
}

const insetDirection = computed(() => {
  // 若当前 hover 节点无法放置子节点，则不存在 inside
  if (
    // 可以放置子节点 &&
    treeState.value.ratio >= 0.4 &&
    treeState.value.ratio <= 0.6
  ) {
    return 'inside'
  }

  return treeState.value.ratio <= 0.5 ? 'above' : 'below'
})

export default defineComponent({
  name: 'DeckLayerNode',
  props: {
    node: {
      type: Object as PropType<LayerTreeNode<any>>,
      required: true
    },
    draggingNodeId: String
  },
  setup(props) {
    const canvasStore = useCanvasStore()
    const { layerTree: treeMap } = storeToRefs(canvasStore)

    const indent = computed(() => {
      return MIN_INDENT + props.node.depth * FOLDER_SIZE
    })

    const isCurrentDragging = computed(() => treeState.value.draggingNode === props.node.id)
    const isDragging = computed(() => !!treeState.value.draggingNode)
    const isHover = computed(() => treeState.value.hoverNode === props.node.id)
    const isHoverInside = computed(() => treeState.value.insideNode === props.node.id)

    const isTickVisible = computed(() => {
      if (!isHover.value) return false

      if (treeState.value.insideNode !== props.node.id) {
        // 当鼠标移动到 indent 时表示要插入到父节点内，此时始终显示
        return true
      }
      // 当触摸到此节点时，仅上、下 才显示
      return insetDirection.value !== 'inside'
    })

    const tickStyle = computed(() => {
      return {
        width: `calc(100% - ${MIN_INDENT}px - ${FOLDER_SIZE}px - ${
          treeState.value.depth * FOLDER_SIZE
        }px)`,
        ...(insetDirection.value === 'above' ? { top: 0 } : { bottom: 0 })
      }
    })

    const onMousedown = (e: MouseEvent) => {
      document.addEventListener('mousemove', onDragMove)
      document.addEventListener('mouseup', onDragEnd)
    }

    const onDragMove = (e: MouseEvent) => {
      if (!isCurrentDragging.value) {
        treeState.value.draggingNode = props.node.id
        console.log('正在拖拽', treeState.value.draggingNode)
      }
      // 设置鼠标样式
    }

    const onDragEnd = (e: MouseEvent) => {
      const hoverNode = treeMap.value.flatNodes.find((i) => i.id === treeState.value.hoverNode)

      let sourceId = treeState.value.hoverNode

      if (hoverNode) {
        // 根据向上查找层级，查找出目标节点对应的祖先节点，插入其下方（为什么是下方？因为inside 和 above 限定只能插入目标节点）
        const realNode = getNthParent(hoverNode, hoverNode.depth - treeState.value.depth)
        if (realNode) {
          sourceId = realNode.id
        }
      }

      const res = treeMap.value.moveNode(
        treeState.value.draggingNode,
        sourceId,
        insetDirection.value
      )

      // moveNode(treeMap.value.children, treeState.value.draggingNode, sourceId, insetDirection.value)

      // res.message && message.info(res.message)

      // 重置树状态
      restoreTreeState()

      clearTimeout(checkIsHoverInsideTimer)
      document.removeEventListener('mousemove', onDragMove)
      document.removeEventListener('mouseup', onDragEnd)
    }

    const elRef = ref<HTMLDivElement>()

    const onMousemove = (e: MouseEvent) => {
      if (isDragging.value) {
        const el = elRef.value!
        const rect = el.getBoundingClientRect()
        const ratio = clamp((e.clientY - rect.top) / rect.height, 0, 1)
        treeState.value.hoverNode = props.node.id
        treeState.value.ratio = ratio

        const depth =
          ratio <= 0.5
            ? props.node.depth
            : clamp(
                Math.floor((e.clientX - rect.left - MIN_INDENT) / FOLDER_SIZE),
                0,
                props.node.depth
              )

        treeState.value.depth = ratio <= 0.5 ? props.node.depth : depth

        // 寻找要插入的父节点是
        if (insetDirection.value === 'inside') {
          treeState.value.insideNode = props.node.id
        } else {
          // 加 1 是因为要插入的是【目标节点】的【父节点】
          const p = getNthParent(props.node, props.node.depth - depth + 1)
          treeState.value.insideNode = p?.id || ''
        }

        clearTimeout(checkIsHoverInsideTimer)
        // 悬停 300ms 自动展开子节点
        checkIsHoverInsideTimer = setTimeout(checkIsHoverInside, 300)
      }
    }

    let checkIsHoverInsideTimer: NodeJS.Timeout
    const checkIsHoverInside = () => {
      if (isHoverInside.value) {
        onToggleExpanded(true)
      }
    }

    const onMouseleave = (e: MouseEvent) => {
      if (treeState.value.hoverNode === props.node.id) {
        treeState.value.hoverNode = ''
      }
    }

    const preventDrag = withModifiers(() => {}, ['stop', 'prevent'])

    const onToggleExpanded = (flag?: boolean) => {
      const node = props.node
      node.expanded = flag ?? !node.expanded
    }

    return () => {
      if (!props.node) return null

      const { id, depth, expanded, children, $component } = props.node

      const { name, hidden, locked } = $component

      return (
        <div
          ref={elRef}
          key={id}
          class={['c_layer-node', isCurrentDragging.value && 'dragging']}
          data-comp-id={id}
          onMousedown={onMousedown}
          onMousemove={onMousemove}
          onMouseleave={onMouseleave}
          onClick={() => {
            console.log(props.node)
          }}
        >
          <div class={['c_layer-node__content', isHoverInside.value && 'bordered']}>
            {/* 缩进 */}
            <div
              class="c_layer-node__indent"
              style={{
                width: `${indent.value}px`
              }}
            ></div>
            {/* 嵌套展开按钮 */}
            <div
              class={['c_layer-node__folder clickable', expanded && 'expanded']}
              data-hidden={!(children?.length! > 0)}
              onMousedown={preventDrag}
              onClick={() => onToggleExpanded()}
            >
              <Icon name="down-fill" />
            </div>
            {/* 图标 */}
            <div class="c_layer-node__icon"></div>
            {/* 节点内容 */}
            <div class="c_layer-node__name">
              {name} {id}
            </div>
            {/* 锁定、隐藏、继承 */}
            <div class="c_layer-node__status">
              <div class="c_layer-node__locked clickable" onMousedown={preventDrag}>
                <Icon name="icon-lose" />
              </div>
              <div class="c_layer-node__hidden clickable" onMousedown={preventDrag}>
                <Icon name="icon-lose" />
              </div>
            </div>
          </div>
          {isTickVisible.value && <div class="c_layer-node__tick" style={tickStyle.value}></div>}
        </div>
      )
    }
  }
})
