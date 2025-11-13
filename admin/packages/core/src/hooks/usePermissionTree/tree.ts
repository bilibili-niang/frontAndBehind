// FIXME useIndeterminate 为 true 时有问题，且不要在类外部控制 useIndeterminate，应当在构造函数一次性决定。
// 或者干脆改成

export interface MenuItem {
  id: string
  parentId: string
  title?: string
  key?: string
  value?: string
  source?: string
  sort?: number
  customId?: string
  customSource?: string
  customName?: string
  code?: string
  name?: string
  path?: string
  component?: string
  hidden?: boolean
  category?: number
  children?: MenuItem[]
}

class PermissionTreeNode {
  public id: string
  public parent: PermissionTreeNode | null = null
  public children: PermissionTreeNode[] = []

  private _checked = false
  private _indeterminate = false

  constructor(id: string) {
    this.id = id
  }

  get checked(): boolean {
    return this._checked
  }

  get indeterminate(): boolean {
    return this._indeterminate
  }

  /** 用于初始化时，仅设置当前节点选中，不影响子节点 */
  setSelfChecked(checked: boolean) {
    this._checked = checked
    this._indeterminate = false
  }

  /** 设置当前节点及所有子节点选中状态，并同步更新父节点状态 */
  setChecked(checked: boolean, useIndeterminate: boolean) {
    this._checked = checked
    this._indeterminate = false // 无论是否使用 indeterminate，setChecked 都会直接设置 checked 状态

    for (const child of this.children) {
      child.setChecked(checked, useIndeterminate)
    }

    if (useIndeterminate) {
      this.updateParentStatus()
    } else {
      if (checked) {
        this.updateParentStatusWhenNotUsingIndeterminate()
      }
      // 当取消勾选时，不更新父节点状态
    }
  }

  /** 更新父节点的 checked 和 indeterminate 状态 (仅当 useIndeterminate 为 true 时使用) */
  updateParentStatus() {
    if (!this.parent) return

    const siblings = this.parent.children
    const allChecked = siblings.every((child) => child.checked)
    const someChecked = siblings.some((child) => child.checked || child.indeterminate)

    this.parent._checked = allChecked
    this.parent._indeterminate = !allChecked && someChecked

    this.parent.updateParentStatus()
  }

  /** 当不使用 indeterminate 时，更新父节点的 checked 状态 */
  updateParentStatusWhenNotUsingIndeterminate() {
    if (!this.parent) return

    const anyChildChecked = this.parent.children.some((child) => child.checked)
    this.parent._checked = anyChildChecked
    this.parent._indeterminate = false // 强制设置为 false，因为我们不使用 indeterminate

    this.parent.updateParentStatusWhenNotUsingIndeterminate()
  }

  /** 是否是叶子节点 */
  isLeaf(): boolean {
    return this.children.length === 0
  }

  /** 遍历收集选中或半选中的 ID */
  collectSelectedIds(includeIndeterminateParents = true): Set<string> {
    const result = new Set<string>()

    const dfs = (node: PermissionTreeNode) => {
      if (node.checked) result.add(node.id)
      if (includeIndeterminateParents && node.indeterminate) result.add(node.id)
      for (const child of node.children) dfs(child)
    }

    dfs(this)
    return result
  }

  findNode(id: string): PermissionTreeNode | null {
    if (this.id === id) return this
    for (const child of this.children) {
      const found = child.findNode(id)
      if (found) return found
    }
    return null
  }
}

export class PermissionTree {
  private rootNodes: PermissionTreeNode[] = []
  private nodeMap = new Map<string, PermissionTreeNode>()
  private useIndeterminate: boolean

  private _nodes: MenuItem[] = []

  constructor(options: { nodes: MenuItem[]; defaultValue?: string[]; useIndeterminate?: boolean }) {
    const { nodes, defaultValue = [], useIndeterminate = true } = options
    this.useIndeterminate = useIndeterminate

    this._nodes = nodes

    const buildTree = (items: MenuItem[], parent: PermissionTreeNode | null): PermissionTreeNode[] => {
      return items.map((item) => {
        const node = new PermissionTreeNode(item.id)
        node.parent = parent
        this.nodeMap.set(item.id, node)
        node.children = buildTree(item.children ?? [], node)
        return node
      })
    }

    this.rootNodes = buildTree(nodes, null)

    // 初始化 defaultValue（仅勾选自身，向上更新状态）
    const leafNodes: PermissionTreeNode[] = []

    for (const id of defaultValue) {
      const node = this.nodeMap.get(id)
      if (node) {
        node.setSelfChecked(true) // 只标记自身，不影响子节点
        leafNodes.push(node)
      }
    }

    // 向上更新父节点的状态为半选中
    for (const node of leafNodes) {
      if (this.useIndeterminate) {
        node.updateParentStatus()
      } else {
        node.updateParentStatusWhenNotUsingIndeterminate()
      }
    }
  }

  get nodes() {
    return this._nodes
  }

  /** 设置新的勾选状态（会影响子节点） */
  setValue(ids: string[]) {
    for (const node of this.nodeMap.values()) {
      node.setChecked(false, this.useIndeterminate)
    }
    for (const id of ids) {
      const node = this.nodeMap.get(id)
      if (node) node.setChecked(true, this.useIndeterminate)
    }
  }

  /** 获取所有选中/半选中节点的 ID */
  getValue(): string[] {
    const result = new Set<string>()
    for (const root of this.rootNodes) {
      if (this.useIndeterminate) {
        for (const id of root.collectSelectedIds(true)) {
          result.add(id)
        }
      } else {
        const dfs = (node: PermissionTreeNode) => {
          if (node.checked) result.add(node.id)
          for (const child of node.children) dfs(child)
        }
        dfs(root)
      }
    }
    return Array.from(result)
  }

  /** 获取某个节点 */
  getNode(id: string): PermissionTreeNode | undefined {
    return this.nodeMap.get(id)
  }
}
