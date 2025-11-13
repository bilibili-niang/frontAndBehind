// 扩展 Vue 的全局组件类型
declare module '@vue/runtime-dom' {
  interface HTMLAttributes {
    // 这里可以添加全局 HTML 属性
    [key: string]: any
  }
}

// 扩展 Vuetify 组件类型
declare module 'vuetify/components' {
  interface VBtn {
    // 添加原生 HTML 按钮属性
    [key: string]: any
  }
}

// 全局类型声明
declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.scss' {
  const content: string
  export default content
}

declare module '*.css' {
  const content: string
  export default content
}
