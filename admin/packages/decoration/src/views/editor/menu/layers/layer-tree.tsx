import { computed, defineComponent, PropType, ref, withModifiers } from 'vue'
import useCanvasStore from '../../../../stores/canvas'
import { storeToRefs } from 'pinia'
import { LayerTreeNode } from '../../../../stores/canvas/tree'
import { Icon } from '@pkg/ui'
import './layer-node.scss'
import { clamp } from 'lodash'
import { useContextMenu } from '@pkg/core'
import useComponentStore from '../../../../stores/component'

export default defineComponent({
  name: 'DeckLayerTree',
  setup() {
    const canvasStore = useCanvasStore()

    const { layerTree } = storeToRefs(canvasStore)

    const nodes = computed(() => layerTree.value.menuNodes)

    const onContextMenu = (node: LayerTreeNode<any>) => {
      canvasStore.selectComponent(node.id)

      useContextMenu(undefined, {
        list: [
          {
            key: 'lock',
            title: node.locked ? '解锁' : '锁定',
            iconfont: node.locked ? 'unlock' : 'lock',
            command: '⌘ L',
            handler: () => {
              node.toggleLocked()
            }
          },
          {
            key: 'hidden',
            title: node.hidden ? '显示' : '隐藏',
            command: '⌘ H',
            iconfont: node.hidden ? 'visible' : 'hidden',
            handler: () => {
              node.toggleHidden()
            }
          },
          {
            key: 'delete',
            title: '删除',
            iconfont: 'tag-delete',
            handler: () => {
              layerTree.value.removeNode(node.id)
            },
            divider: true
          }
        ]
      })
    }

    return () => {
      return (
        <div
          class={{
            'deck_layer-tree': true,
            dragging: layerTree.value.isMoving,
            [`drop-over-${layerTree.value.movePosition}`]: true
          }}
        >
          {nodes.value.map((node) => {
            return (
              <LayerNode
                node={node as any}
                // @ts-ignore
                onContextmenu={() => {
                  onContextMenu(node as any)
                }}
              />
            )
          })}
        </div>
      )
    }
  }
})

/** 阻止拖拽冒泡 */
const preventDrag = withModifiers(() => {}, ['stop', 'prevent'])

const FOLDER_SIZE = 20
const MIN_INDENT = 6

const LayerNode = defineComponent({
  props: {
    node: {
      type: Object as PropType<LayerTreeNode<any>>,
      required: true
    }
  },
  setup(props) {
    const canvasStore = useCanvasStore()
    const { layerTree } = storeToRefs(canvasStore)

    const componentStore = useComponentStore()
    const thumbnailMap = computed(() => {
      const obj: { [key: string]: string | undefined } = {}
      componentStore.componentList.forEach((item) => {
        obj[item.key] = item.thumbnail
      })
      return obj
    })

    const image = computed(() => {
      const key = props.node.$component.key

      const thumbnail = thumbnailMap.value[key]

      return (key === 'image' ? props.node.$component.config.image?.url : thumbnail) || thumbnail
    })

    /** 节点 DOM 引用 */
    const nodeRef = ref<HTMLDivElement>()

    /** 是否悬浮在该节点上 */
    const isHovered = computed(() => layerTree.value.hoverNode === props.node)

    /** 子节点缩进，单位 px */
    const indent = computed(() => {
      return MIN_INDENT + props.node.depth * FOLDER_SIZE
    })

    /** 子节点 */
    const children = computed(() => {
      return props.node.children || []
    })

    /** 当前节点拖拽中（拖拽源节点） */
    const isCurrentDragging = computed(() => {
      return layerTree.value.draggingNode === props.node
    })

    /** 悬浮在当前节点内部 */
    const isHoverInside = computed(() => {
      return layerTree.value.insideNode === props.node
    })

    /** 是否显示插入光标 */
    const isTickVisible = computed(() => {
      if (!layerTree.value.isMoving || !isHovered.value) return false

      if (layerTree.value.insideNode !== props.node) {
        // 当鼠标移动到 indent 时表示要插入到父节点内，此时始终显示
        return true
      }
      // 当触摸到此节点时，仅上、下 才显示
      return layerTree.value.movePosition !== 'inside'
    })

    const tickStyle = computed(() => {
      if (!isTickVisible.value) return {}
      return {
        width: `calc(100% - ${
          MIN_INDENT + ((layerTree.value.hoverDepth ?? 0) + 1) * FOLDER_SIZE
        }px)`
      }
    })

    const initialPos = {
      x: 0,
      y: 0
    }

    /** 在节点上按下时 */
    const onMousedown = (e: MouseEvent) => {
      initialPos.x = e.pageX
      initialPos.y = e.pageY

      // 注册鼠标事件
      document.addEventListener('mousemove', onDragMove)
      document.addEventListener('mouseup', onDragEnd)
    }

    const onDragMove = (e: MouseEvent) => {
      if (!layerTree.value.draggingNode) {
        if (calculateDistance(initialPos.x, initialPos.y, e.pageX, e.pageY) < 6) {
          // 移动距离大于 6 像素，防止点击的时候可能抖动触发拖动
          return void 0
        }

        layerTree.value.draggingNode = props.node
        console.log('开始移动：', props.node.id)
        // 设置鼠标样式
      }
    }

    /** 拖拽结束 */
    const onDragEnd = (e: MouseEvent) => {
      const sourceNode = layerTree.value.draggingNode
      const hoverNode = layerTree.value.hoverNode
      if (sourceNode && hoverNode) {
        let sourceId = hoverNode?.id
        const realNode = layerTree.value.getNthParent(
          hoverNode as any,
          hoverNode.depth - (layerTree.value.hoverDepth ?? hoverNode.depth)
        )
        if (realNode) {
          sourceId = realNode.id
        }
        // const res =
        layerTree.value.moveNode(sourceNode.id, sourceId, layerTree.value.movePosition)
        // console.log(res)
      }

      // 移除鼠标样式

      // 清理拖拽状态
      layerTree.value.resetMoveState()

      // 清除鼠标事件
      document.removeEventListener('mousemove', onDragMove)
      document.removeEventListener('mouseup', onDragEnd)
    }

    let lastPos = ''
    const onMousemove = (e: MouseEvent) => {
      const pos = `${e.pageX},${e.pageY}`
      if (lastPos === pos) {
        return void 0
      }
      lastPos = pos
      if (!layerTree.value.isMoving) {
        return void 0
      }
      const el = nodeRef.value!
      const rect = el.getBoundingClientRect()
      // 鼠标在当前节点中 y 相对 height 的比率，用于判断插入位置的是上方、内部、下方
      const ratio = clamp((e.clientY - rect.top) / rect.height, 0, 1)

      // 鼠标移动到 "indent" 位置时，计算出要向上提升的层级，同时忽略 "inside" 模式
      const depth =
        ratio <= 0.5
          ? props.node.depth
          : clamp(
              Math.floor((e.clientX - rect.left - MIN_INDENT) / FOLDER_SIZE),
              0,
              props.node.depth
            )

      layerTree.value.hoverNode = props.node
      layerTree.value.hoverRatio = ratio
      layerTree.value.hoverDepth = depth

      if (layerTree.value.movePosition === 'inside') {
        // 位置 inside 表示当前悬浮的节点，就是要插入的节点
        layerTree.value.insideNode = props.node
      } else {
        const p = layerTree.value.getNthParent(props.node, props.node.depth - depth + 1)
        layerTree.value.insideNode = p === props.node ? undefined : p || undefined
      }

      checkIsHoverInside()
    }

    let checkIsHoverInsideTimer: NodeJS.Timeout

    /** 检测是否悬浮在该节点上 300ms 后自动展开子节点 */
    const checkIsHoverInside = () => {
      clearTimeout(checkIsHoverInsideTimer)
      checkIsHoverInsideTimer = setTimeout(() => {
        if (isHoverInside.value) {
          props.node.toggleExpand(true)
        }
      }, 300)
    }

    /** 鼠标离开时，清除悬浮节点 */
    const onMouseleave = (e: MouseEvent) => {
      if (layerTree.value.hoverNode === props.node) {
        layerTree.value.hoverNode = undefined
      }
    }

    const onToggleExpand = withModifiers(() => {
      props.node.toggleExpand()
    }, ['stop'])
    const onToggleLocked = withModifiers(() => {
      props.node.toggleLocked()
    }, ['stop'])
    const onToggleHidden = withModifiers(() => {
      props.node.toggleHidden()
    }, ['stop'])

    const isHidden = computed(() => props.node.hidden)
    const isInheritHidden = computed(() => props.node.inheritHidden)
    const isLocked = computed(() => props.node.locked)
    const isInheritLocked = computed(() => props.node.inheritLocked)

    return () => {
      const node = props.node
      const { id, expanded, locked, hidden, $component, selected, inheritSelected } = node
      const { name } = $component
      return (
        <div
          ref={nodeRef}
          key={id}
          class={{
            'c_layer-node': true,
            dragging: isCurrentDragging.value,
            bordered: isHoverInside.value,
            hidden: hidden || isInheritHidden.value,
            selected: selected,
            'inherit-selected': inheritSelected
          }}
          data-comp-id={id}
          onMousedown={onMousedown}
          onMousemove={onMousemove}
          onDragover={onMousemove}
          onMouseleave={onMouseleave}
          onDragleave={onMouseleave}
          onClick={() => {
            canvasStore.selectComponent(id)
          }}
        >
          <div class="c_layer-node__content">
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
              data-hidden={!(children.value?.length! > 0)}
              onMousedown={preventDrag}
              onClick={onToggleExpand}
            >
              <Icon name="down-fill" />
            </div>
            {/* 图标 */}
            <div
              class="c_layer-node__icon"
              style={{
                backgroundImage: `url(${image.value})`
              }}
            >
              {!image.value && <iconpark-icon class="icon" name="ad-product"></iconpark-icon>}
            </div>
            {/* 节点内容 */}
            <div class="c_layer-node__name">
              {name}
              {import.meta.env.DEV && ` ${id}`}
            </div>
            {/* 锁定、隐藏、继承 */}
            <div class="c_layer-node__status">
              <div
                class={[
                  'c_layer-node__locked clickable',
                  isLocked.value && 'active',
                  isInheritLocked.value && 'inherited'
                ]}
                onMousedown={preventDrag}
                onClick={onToggleLocked}
              >
                {!isLocked.value && isInheritLocked.value ? (
                  <div class="dot"></div>
                ) : (
                  <Icon name={isLocked.value ? 'lock' : 'unlock'} />
                )}
              </div>
              <div
                class={[
                  'c_layer-node__hidden clickable',
                  isHidden.value && 'active',
                  isInheritHidden.value && 'inherited'
                ]}
                onMousedown={preventDrag}
                onClick={onToggleHidden}
              >
                {!hidden && isInheritHidden.value ? (
                  <div class="dot"></div>
                ) : (
                  <Icon name={hidden ? 'hidden' : 'visible'} />
                )}
              </div>
            </div>
          </div>
          {isTickVisible.value && <div class="c_layer-node__tick" style={tickStyle.value}></div>}
        </div>
      )
    }
  }
})

function calculateDistance(x1: number, y1: number, x2: number, y2: number) {
  const deltaX = x2 - x1
  const deltaY = y2 - y1
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
}
