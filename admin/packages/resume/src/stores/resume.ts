import { defineStore } from 'pinia'
import { uuid } from '@pkg/core'
import type { ResumeContent, ThemeConfig } from '../types/resume'

const defaultTheme: ThemeConfig = {
  primaryColor: '#6366f1',
  fontFamily: 'Inter',
  templateId: 'modern',
  spacing: 1
}

const defaultContent: ResumeContent = {
  profile: { 
    name: '张三', 
    title: '高级前端工程师', 
    email: 'zhangsan@example.com', 
    phone: '13800138000',
    summary: '拥有 5 年前端开发经验，精通 Vue/React 技术栈，擅长性能优化与工程化建设。',
    location: '上海',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' 
  },
  educations: [
    {
      id: 'edu-1',
      school: '某知名大学',
      degree: '本科',
      major: '计算机科学与技术',
      startDate: '2015-09',
      endDate: '2019-06',
      description: '主修课程：数据结构、操作系统、计算机网络。在校期间获得多次奖学金。'
    }
  ],
  experiences: [
    {
      id: 'exp-1',
      company: '某互联网大厂',
      position: '前端开发工程师',
      startDate: '2021-07',
      endDate: '至今',
      description: '负责核心业务线的前端开发，主导了 B 端管理系统的重构，将首屏加载时间降低了 40%。'
    },
    {
      id: 'exp-2',
      company: '某创业公司',
      position: '前端开发',
      startDate: '2019-07',
      endDate: '2021-06',
      description: '独立负责公司官网和小程序的开发，实现了响应式布局和多端适配。'
    }
  ],
  projects: [
    {
      id: 'proj-1',
      name: '在线简历制作平台',
      role: '核心开发者',
      startDate: '2023-01',
      endDate: '2023-06',
      description: '基于 Vue 3 + TypeScript 开发的在线简历编辑器，支持实时预览、PDF 导出和主题切换。'
    }
  ],
  skills: ['Vue 3 / React', 'TypeScript / JavaScript', 'Node.js / Koa', 'Webpack / Vite', 'CSS3 / Sass / Tailwind'],
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