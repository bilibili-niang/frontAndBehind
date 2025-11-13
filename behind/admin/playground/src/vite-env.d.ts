/// <reference types="vite/client" />
/// <reference types="vite-plugin-pages/client" />

// 扩展 ImportMeta 接口
declare module '~pages' {
  import type { RouteRecordRaw } from 'vue-router'
  const routes: RouteRecordRaw[]
  export default routes
}

// 声明 .vue 文件模块
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
