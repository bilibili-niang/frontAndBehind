// TODO 使用类实现，数据、视图分离。

import { message } from '@anteng/ui'
import { DeckComponent } from './types'
import { checkIsNestable } from './nest'

export interface ITreeNode<T = any> {
  id: string
  children?: ITreeNode<T>[]
  expanded?: boolean
}

/** 图层节点 */
export class LayerTreeNode<T extends ITreeNode<T>> {
  /** 图层 id，和组件 id 一致 */
  id: string
  /** 子节点 */
  children: LayerTreeNode<ITreeNode<T>>[] = []
  /** 是否展开 */
  expanded = false
  private $parent: LayerTreeNode<T> | null = null
  readonly $component: DeckComponent
  constructor(
    readonly $tree: LayerTree<T>,
    node: T,
    parentNode: LayerTreeNode<T> | null = null
  ) {
    this.id = node.id
    const children = (node.children || [])?.map(
      (childNode) => new LayerTreeNode($tree, childNode, this)
    )
    this.children = children || []
    this.expanded = node.expanded ?? false
    this.$parent = parentNode

    // 找到组件，关联
    this.$component = this.$tree.getComponent(this.id)!
  }

  /** 父节点 */
  get parent() {
    return this.$parent
  }

  set parent(p: LayerTreeNode<T> | null) {
    this.$parent = p
    this.$component.parent = p?.id || null
  }

  /** 获取所有父节点的 ID（从当前节点到根节点） */
  get parentIds(): string[] {
    // 如果没有父节点，则返回空数组
    if (!this.$parent) {
      return []
    }
    // 递归获取父节点的 ID 列表，并拼接当前节点的 ID
    return [...this.$parent.parentIds, this.$parent.id]
  }

  /** 被选中 */
  get selected(): boolean {
    return this.$tree.currentSelectedNode === this
  }

  /** 继承被选中 */
  get inheritSelected(): boolean {
    return this.$parent?.selected || this.$parent?.inheritSelected || false
  }

  /** 隐藏 */
  get hidden(): boolean {
    return this.$component.hidden ?? false
  }

  /** 继承隐藏 */
  get inheritHidden(): boolean {
    return this.$parent?.hidden || this.$parent?.inheritHidden || false
  }

  /** 切换隐藏状态，默认取反切换，可传入确定的状态 */
  toggleHidden(value?: boolean) {
    this.$component.hidden = value ?? !this.$component.hidden
  }

  /** 锁定 */
  get locked(): boolean {
    return this.$component.locked ?? false
  }

  /** 继承锁定 */
  get inheritLocked(): boolean {
    return this.$parent?.locked || this.$parent?.inheritLocked || false
  }

  /** 切换锁定状态，默认取反切换，可传入确定的状态 */
  toggleLocked(value?: boolean) {
    this.$component.locked = value ?? !this.$component.locked
  }

  /** 嵌套深度，未嵌套时为 0，依次往下累加 1 */
  get depth(): number {
    if (!this.$parent) {
      return 0
    }
    return this.$parent.depth + 1
  }

  getComponent() {
    return this.$component
  }

  /** 切换展开状态，默认取反切换，可传入确定的状态 */
  toggleExpand(value?: boolean) {
    this.expanded = value ?? !this.expanded
  }

  /** 删除节点，此方法连同子节点一并删除 */
  remove() {}
}

/** 图层树 */
export class LayerTree<T extends ITreeNode<T> = any> {
  children: LayerTreeNode<T>[] = []
  // 这里 组件<->图层 要怎么进行双向关联才好呢？是否会有意外情况无法完整 1:1 映射？
  components: DeckComponent[] = []

  /** 拖动中的节点 */
  draggingNode?: LayerTreeNode<T>
  /** 鼠标悬浮的节点 */
  hoverNode?: LayerTreeNode<T>
  /** 要插入的节点 */
  insideNode?: LayerTreeNode<T>
  /** 鼠标在悬浮节点上的比例（Y轴 height） */
  hoverRatio?: number
  /** 鼠标在悬浮节点上的深度（0表示同一深度， -1 则表示向上一层，...） */
  hoverDepth?: number

  private selectedId: string | null = null

  constructor(nodes: T[] = [], components: DeckComponent[] = []) {
    this.components = components
    this.children = nodes.map((node) => new LayerTreeNode(this, node))
  }

  addNode(component: DeckComponent) {
    const node = new LayerTreeNode(this, {
      id: component.id,
      expanded: false,
      children: []
    } as ITreeNode<T>)

    if (component.parent) {
      const p = this.getNode(component.parent)

      if (p) {
        node.parent = p
        p.children.push(node)
        return void 0
      }
    }

    this.children.push(node)
  }

  /** 移除节点 */
  removeNode(id: string) {
    const sourceNode = this.getNode(id)
    if (!sourceNode) return void 0
    // 拿到父节点
    const parentNode = sourceNode.parent

    if (parentNode) {
      // 从父节点中移除源节点
      parentNode.children = parentNode.children.filter((child) => child.id !== id)
    } else {
      const index = this.children.indexOf(sourceNode)
      if (index != -1) {
        this.children.splice(index, 1)
      }
    }

    // 移除对应的组件
    const removeComponent = (node: LayerTreeNode<T>) => {
      const i = this.components.indexOf(node.$component)
      if (i !== -1) {
        this.components.splice(i, 1)
      }
      ;(node.children || []).forEach((childNode) => removeComponent(childNode))
    }

    removeComponent(sourceNode)

    return sourceNode
  }

  /** 选择组件 */
  selectNode(id: string | null) {
    this.selectedId = id
  }

  /** 当前选中节点 */
  get currentSelectedNode() {
    return this.selectedId ? this.getNode(this.selectedId) : null
  }

  /** 当前选中组件 */
  get currentSelectedComponent() {
    return this.currentSelectedNode?.$component
  }

  /** 通过 id 获取节点 */
  getNode(id: string) {
    return this.flatNodes.find((node) => node.id === id)
  }

  /** 通过 id 获取组件 */
  getComponent(id: string) {
    return this.components.find((item) => item.id === id)
  }

  /**
   * 扁平化节点
   */
  get flatNodes() {
    const flatten = (nodes: LayerTreeNode<T>[], parent?: LayerTreeNode<T>): LayerTreeNode<T>[] => {
      return nodes.reduce((list, node) => {
        const children = flatten(node.children || [])
        return list.concat([node, ...children])
      }, [] as LayerTreeNode<T>[])
    }
    return flatten(this.children)
  }

  /**
   * 扁平化节点（不包含折叠的节点）
   *
   * 用于图层节点遍历展示，这里貌似会很频繁地计算
   */
  get menuNodes() {
    const flatten = (nodes: LayerTreeNode<T>[], parent?: LayerTreeNode<T>): LayerTreeNode<T>[] => {
      return nodes.reduce((list, node) => {
        if (!node.expanded) {
          return list.concat([node])
        }
        const children = flatten(node.children || [])
        return list.concat([node, ...children])
      }, [] as LayerTreeNode<T>[])
    }
    return flatten(this.children)
  }

  /** 是否拖拽移动节点中 */
  get isMoving() {
    return !!this.draggingNode
  }

  /** 移动位置 */
  get movePosition() {
    const ratio = this.hoverRatio ?? 0
    if (
      // 可以放置子节点 &&
      ratio >= 0.4 &&
      ratio <= 0.6
    ) {
      return 'inside'
    }

    return ratio <= 0.5 ? 'above' : 'below'
  }

  /**
   * 移动节点
   * @param sourceId 源节点
   * @param targetId 目标节点
   * @param position 相对目标节点的位置
   */
  moveNode(
    sourceId: string,
    targetId: string,
    position: 'above' | 'below' | 'inside'
  ): { success: boolean; message: string } {
    console.log(sourceId, '->', targetId, position)

    if (sourceId === targetId) {
      return { success: false, message: '节点相同，无需移动' }
    }

    // 获取源节点和目标节点
    const sourceNode = this.getNode(sourceId)
    const targetNode = this.getNode(targetId)

    if (!sourceNode || !targetNode) {
      return { success: false, message: '找不到源节点或目标节点' }
    }

    // 如果目标节点是源节点的父节点，或者目标节点是源节点的祖先节点，无法执行移动操作
    if (targetNode.parentIds.includes(sourceId)) {
      return { success: false, message: '无法将源节点移到目标节点下（循环关系或父子关系冲突）' }
    }

    if (
      position === 'inside'
        ? !checkIsNestable(sourceNode.$component.key, targetNode.$component.key, true)
        : targetNode.parent &&
          !checkIsNestable(sourceNode.$component.key, targetNode.parent?.$component.key!, true)
    ) {
      throw new Error('该节点不支持嵌套')
    }

    // 拿到父节点
    const parentNode = sourceNode.parent

    // 缓存子节点，防止移动失败后无法还原
    const cacheParentChildren = parentNode?.children || this.children

    if (parentNode) {
      // if (!checkIsNestable(sourceNode.$component.key, parentNode.$component.key, true)) {
      //   console.log('??', parentNode, sourceNode)
      //   throw new Error('该节点不支持嵌套')
      // }

      // 从父节点中移除源节点
      parentNode.children = parentNode.children.filter((child) => child.id !== sourceId)
    } else {
      const index = this.children.indexOf(sourceNode)
      if (index === -1) {
        // 其实这里还可以遍历去查找？后续再优化下关联错误的修复吧。
        return { success: false, message: '移动失败，节点不在本树上' }
      }
      this.children.splice(index, 1)
    }

    // 重新设置源节点的 $parent 为 null (防止可能出现的残余关系)
    sourceNode.parent = null

    try {
      // 移动源节点到目标节点的关系位置
      switch (position) {
        case 'above':
        case 'below':
          if (targetNode.parent) {
            const index = targetNode.parent.children.indexOf(targetNode)
            if (index !== -1) {
              targetNode.parent.children.splice(
                position === 'above' ? index : index + 1,
                0,
                sourceNode
              )
              // 更新源节点的 $parent
              sourceNode.parent = targetNode.parent
            } else {
              throw new Error('父子节点关联错误，找不到目标节点在父节点中的索引')
            }
          } else {
            // 没有父节点时，尝试在树根查找
            const index = this.children.indexOf(targetNode)
            if (index !== -1) {
              this.children.splice(position === 'above' ? index : index + 1, 0, sourceNode)
              // 更新源节点的 $parent
              sourceNode.parent = null
            } else {
              throw new Error('父子节点关联错误，找不到目标节点在树中的索引')
            }
          }
          break

        case 'inside':
          targetNode.children = targetNode.children || []
          // 放置到最上面
          targetNode.children.unshift(sourceNode)
          // 更新源节点的 $parent
          sourceNode.parent = targetNode
          // 放进去了，父节点全部展开
          // TODO  改成当前组件的所有父节点全部展开（画布中点击组件选中时也应该如此，可以统一处理）
          targetNode.expanded = true
          break
        default:
          throw new Error('关系位置错误，未发生移动')
      }

      return { success: true, message: '移动成功' }
    } catch (err: any) {
      // 还原父子节点结构
      if (parentNode) {
        parentNode.children = cacheParentChildren!
        sourceNode.parent = parentNode
      } else {
        this.children = cacheParentChildren
      }

      return { success: false, message: err?.message || '移动失败' }
    }
  }

  /** 获取节点向上 n 层的祖先节点 */
  getNthParent(node: LayerTreeNode<T>, n: number) {
    if (n <= 0 || !node || !node.parent) {
      return node // 如果 n <= 0 或 obj 没有 $parent，直接返回
    }

    let current = node
    for (let i = 0; i < n; i++) {
      if (!current.parent) {
        return null // 如果某个父对象不存在，返回 null
      }
      current = current.parent
    }

    return current
  }

  /** 重置移动状态 */
  resetMoveState() {
    this.draggingNode = undefined
    this.insideNode = undefined
  }
}
