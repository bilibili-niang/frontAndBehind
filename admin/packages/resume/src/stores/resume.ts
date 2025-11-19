import { defineStore } from 'pinia'
import { uuid } from '@anteng/core'

export type ResumeBlock = { id: string; type: string; props: any }

const initialBlocks: ResumeBlock[] = []
const uniqueTypes = new Set<string>([
  'basic-info',
  'summary',
  'education',
  'work',
  'project',
  'skills',
  'award'
])

const resumeStore = defineStore('resume', {
  state: () => ({
    blocks: initialBlocks as ResumeBlock[],
    selectedId: null as string | null,
    resumeId: null as string | null
  }),
  getters: {
    selected(state) {
      return state.blocks.find(b => b.id === state.selectedId) || null
    }
  },
  actions: {
    add(type: string, props: any = {}) {
      if (uniqueTypes.has(type)) {
        const existed = this.blocks.find(b => b.type === type)
        if (existed) {
          this.selectedId = existed.id
          return
        }
      }
      const id = uuid(12)
      const block = { id, type, props }
      this.blocks.push(block)
      this.selectedId = id
    },
    remove(id: string) {
      this.blocks = this.blocks.filter(b => b.id !== id)
      if (this.selectedId === id) this.selectedId = null
    },
    select(id: string | null) {
      this.selectedId = id
    },
    update(id: string, next: any) {
      const b = this.blocks.find(x => x.id === id)
      if (b) b.props = { ...b.props, ...next }
    },
    move(oldIndex: number, newIndex: number) {
      if (oldIndex === newIndex) return
      const list = [...this.blocks]
      const [item] = list.splice(oldIndex, 1)
      list.splice(newIndex, 0, item)
      this.blocks = list
    },
    setBlocks(blocks: ResumeBlock[]) {
      this.blocks = Array.isArray(blocks) ? blocks : []
    },
    toJSON() {
      return JSON.stringify({ blocks: this.blocks })
    },
    toObject() {
      return { blocks: this.blocks }
    },
    fromJSON(textOrObj: any) {
      try {
        const obj = typeof textOrObj === 'string' ? JSON.parse(textOrObj || '{}') : (textOrObj || {})
        const list = Array.isArray(obj?.blocks) ? obj.blocks : []
        this.blocks = list
      } catch {
        this.blocks = []
      }
    },
    setResumeId(id: string | null) {
      this.resumeId = id
    }
  }
})

export default resumeStore