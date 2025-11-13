import { ComponentPackage } from '../component'

export type ComponentAttrs = {
  backgroundEnable: boolean
  background: string
  opacity: number
  borderRadius: [number, number, number, number]
  border: {
    enable: boolean
    shape: 'solid' | 'dashed' | 'dotted'
    width: number
    color: string
  }
  margin: [number, number, number, number]
  padding: [number, number, number, number]
  overflow: 'visible' | 'hidden'
}
export interface DeckComponent<C = any> {
  id: string
  key: string
  name: string
  version: string
  config: C
  attrs: ComponentAttrs
  parent?: string | null
  hidden: boolean
  locked: boolean
  package?: ComponentPackage
  __RETRIEVE_DEFAULT_DATA?: boolean
}

/** 组件节点树形映射 */
export type TreeCompNode = {
  id: string
  children: TreeCompNode[]
  expanded: boolean
}

// /** 组件节点树形映射 */
// export type FlatTreeCompNode = {
//   id: string
//   parents: string[]
//   children: string[]
//   expanded: boolean
//   /** 父节点 */
//   $parent: FlatTreeCompNode
//   /** 子节点 */
//   $children: FlatTreeCompNode
//   /** 在父节点子列表的下标索引 */
//   $index: number
// }

export type FlattenTreeCompNode = TreeCompNode & {
  $depth: number
  $comp: DeckComponent
  $node: TreeCompNode
  $parent?: FlattenTreeCompNode
  $children: FlattenTreeCompNode[]
  $hidden?: boolean
  $locked?: boolean
  $inheritLocked?: boolean
  $inheritHidden?: boolean
}
