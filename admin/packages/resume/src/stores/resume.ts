import { defineStore } from 'pinia'
import { uuid } from '@pkg/core'
import type { ResumeContent, ThemeConfig } from '../types/resume'

const defaultTheme: ThemeConfig = {
  primaryColor: '#6366f1',
  fontFamily: 'Inter',
  templateId: 'modern',
  spacing: 1,
  pagePadding: 24,
  blockPadding: 16,
  blockGap: 12,
  blockDividerEnabled: true,
  blockDividerWidth: 1,
  blockDividerColor: 'rgba(0,0,0,0.06)',
  canvasOffsetX: 0,
  canvasOffsetY: 80
}

const defaultContent: ResumeContent = {
  profile: { name: '', title: '', email: '', phone: '', summary: '', location: '', avatar: '' },
  educations: [],
  experiences: [],
  projects: [],
  skills: [],
  customModules: [],
  layout: { order: ['profile', 'educations', 'experiences', 'projects', 'skills'], hidden: [] }
}

export const useResumeStore = defineStore('resume', {
  state: () => ({
    resumeId: null as string | null,
    content: JSON.parse(JSON.stringify(defaultContent)) as ResumeContent,
    themeConfig: { ...defaultTheme } as ThemeConfig,
    activeModuleId: null as string | null, // 当前选中的模块ID (例如 'profile', 'edu-1')
    activeModuleType: null as string | null // 当前选中模块的类型 (例如 'profile', 'education')
  }),

  actions: {
    // 设置当前简历ID
    setResumeId(id: string | null) {
      this.resumeId = id
    },

    // 选中模块
    setActiveModule(id: string | null, type: string | null = null) {
      this.activeModuleId = id
      this.activeModuleType = type
    },

    // 更新整个模块数据 (例如 Profile)
    updateModuleData<K extends keyof ResumeContent>(moduleKey: K, data: Partial<ResumeContent[K]>) {
      if (typeof this.content[moduleKey] === 'object' && !Array.isArray(this.content[moduleKey])) {
        // 对象类型 (Profile)
        Object.assign(this.content[moduleKey], data)
      } else {
        // 数组类型，通常不应该直接调这个，而是调 updateItem
        this.content[moduleKey] = data as any
      }
    },

    // 更新列表型模块中的单项 (例如 Education)
    updateListItem(moduleKey: 'educations' | 'experiences' | 'projects', itemId: string, data: any) {
      const list = this.content[moduleKey] as any[]
      const index = list.findIndex(item => item.id === itemId)
      if (index !== -1) {
        list[index] = { ...list[index], ...data }
      }
    },

    // 添加列表项
    addListItem(moduleKey: 'educations' | 'experiences' | 'projects', item: any = {}) {
      const newItem = { id: uuid(8), ...item }
      ;(this.content[moduleKey] as any[]).push(newItem)
      return newItem.id
    },

    // 删除列表项
    removeListItem(moduleKey: 'educations' | 'experiences' | 'projects', itemId: string) {
      this.content[moduleKey] = (this.content[moduleKey] as any[]).filter(item => item.id !== itemId)
      if (this.activeModuleId === itemId) {
        this.activeModuleId = null
      }
    },
    
    // 移动列表项
    moveListItem(moduleKey: 'educations' | 'experiences' | 'projects', itemId: string, direction: 'up' | 'down') {
      const list = this.content[moduleKey] as any[]
      const index = list.findIndex(item => item.id === itemId)
      if (index === -1) return
      const target = direction === 'up' ? index - 1 : index + 1
      if (target < 0 || target >= list.length) return
      const tmp = list[index]
      list[index] = list[target]
      list[target] = tmp
    },

    // 更新布局顺序
    updateLayoutOrder(newOrder: string[]) {
      this.content.layout.order = newOrder
    },

    // 更新主题配置
    updateTheme(config: Partial<ThemeConfig>) {
      Object.assign(this.themeConfig, config)
    },

    // 序列化
    toJSON() {
      return JSON.stringify({
        content: this.content,
        themeConfig: this.themeConfig
      })
    },

    toObject() {
      return {
        content: this.content,
        themeConfig: this.themeConfig
      }
    },

    // 反序列化
    fromJSON(textOrObj: any) {
      try {
        const obj = typeof textOrObj === 'string' ? JSON.parse(textOrObj || '{}') : (textOrObj || {})
        
        // 兼容旧数据结构 (如果有的话)，或者直接覆盖
        if (obj.content) {
          this.content = { ...defaultContent, ...obj.content }
        } else if (obj.blocks) {
          // TODO: 这里可能需要一个迁移逻辑，把旧的 blocks 转换为新的 content
          console.warn('Detected legacy resume data format')
        }
        
        if (obj.themeConfig) {
          this.themeConfig = { ...defaultTheme, ...obj.themeConfig }
        }
      } catch (e) {
        console.error('Failed to parse resume data', e)
      }
    }
  }
})

export default useResumeStore
