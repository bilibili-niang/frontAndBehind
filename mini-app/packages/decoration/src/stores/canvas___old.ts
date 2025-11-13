import { defineStore } from 'pinia'
import { ref } from 'vue'

// 画布组件基础类型（最小满足当前渲染组件的类型需求）
export type DeckComponent<T = any> = {
  id: string
  key?: string
  name?: string
  attrs?: any
  config?: T
}

type LayerNode = { id: string; parentId?: string; children?: LayerNode[] }

// 画布状态：目前仅用于选择组件，从而驱动模态等组件的显示/隐藏
export const useCanvasStore = defineStore('canvas', () => {
  const layerTree = ref<{ currentSelectedNode: LayerNode | null }>({ currentSelectedNode: null })

  const selectComponent = (id: string) => {
    layerTree.value.currentSelectedNode = id ? { id } : null
  }

  return {
    layerTree,
    selectComponent
  }
})

export default useCanvasStore