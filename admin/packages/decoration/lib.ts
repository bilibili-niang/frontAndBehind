export { default as decorationList } from './src/components/decorationPage/list'
export { default as decorationNew } from './src/components/decorationPage/new'
export { default as renderHeader } from './src/components/renderHeader'
export { default as navigationList } from './src/components/navigation/list'
export { default as systemList } from './src/components/systempage/list'
export { default as systemPageDecorate } from './src/components/systempage/decorate'
export * from './src/utils'
export * from './src/render-components/defineDecorationComponent'
export * from './src/render-components/defineDeckComponent'
export { default as StatusBar } from './src/canvas-components/components/navigator/status-bar'
// 装修页面的沉浸式/非沉浸式的渲染
export { default as PhoneNavbar } from './src/canvas-components/components/navigator/basic'

// 装修页面编辑/新建
import DeckApp from './src/views/deck-app'

import CommonDeckPage from './src/views/common-deck-page'

export {
  DeckApp,
  CommonDeckPage
}
// 画布组件基础类型（最小满足当前渲染组件的类型需求）
export type DeckComponent<T = any> = {
  id: string
  key?: string
  name?: string
  attrs?: any
  config?: T
}
// 导出动作注册方法（避免循环依赖问题）
export { registerDecorationActions } from './src/actions/register'