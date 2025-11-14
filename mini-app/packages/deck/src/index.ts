export { default as DeckRender } from './render'
export * from './render/comps'
export * from './types'

// 定义一个辅助类型，用于在原有类型基础上添加 children 属性
type TreeNode<T> = T & { children: TreeNode<T>[] }

/**
 * 树形化组件结构
 *
 * 扁平 -> 树形
 */
export const treeifyComponents = <T extends { id: string; parent?: string }>(components: T[]): TreeNode<T>[] => {
  const map: { [key: string]: TreeNode<T> } = {}
  const roots: TreeNode<T>[] = []

  // 初始化映射，每个节点包含空的 children 数组
  components.forEach(component => {
    // 可能已经树形化过了，children 要放前面，可以覆盖掉
    map[component.id] = { children: [], ...component } as TreeNode<T>
  })

  // 构建树结构
  components.forEach(component => {
    const node = map[component.id]
    if (component.parent) {
      if (map[component.parent]) {
        map[component.parent].children.push(node)
      } else {
        // 如果父节点不存在，则将当前节点视为根节点
        roots.push(node)
      }
    } else {
      // 如果没有指定父节点，则将其视为根节点
      roots.push(node)
    }
  })

  return roots
}

export { default as DeckNavigator } from './render/navigator'
