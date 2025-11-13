// 基座组件
import BaseApp from './src/components/baseApp'
import useCrud from './src/hooks/useCrud'
import useModal from './src/hooks/useModal'
import useImagePreview from './src/hooks/useImagePreview'
import useImageSelector from './src/hooks/useImageSelector'
import test from './src/utils/test'

// 导出组件/方法
export { default as useRichTextEditor } from './src/hooks/useRichTextEditor'
export { default as request } from './src/api/request'
export {
  BaseApp,
  useCrud,
  useModal,
  useImagePreview,
  useImageSelector,
  test
}
// 详情视图/预览相关 Hook
export { useDetailView } from './src/hooks/useDetailView'
export { default as usePreviewPage } from './src/hooks/usePreviewPage'
export { default as useWebView } from './src/hooks/useWebView'
export * from './src/hooks/useRequestErrorMessage'
export * from './src/hooks/useSchemaFormModal'
export { default as SchemaErrors } from './src/hooks/useSchemaFormModal/errors'

// 搜索表格相关导出
export {
  default as SearchTable,
  useSearchTable,
  useTabSearchTable,
  useSearchTableRefresh,
  useSearchTableReload,
  useTableAction,
  useTableLongText,
  useTableImages,
  useTableAddress,
  type SearchTableConfig
} from './src/components/search-table'

export { default as Spin } from './src/components/spin'
export { type ImageDefine } from './src/components/image-selector/Resource'
export * from './src/utils'
export { default as useAddressSelector, type AddressData } from './src/hooks/useAddressSelector'
export { default as useContextMenu, type ContextMenuItem, type ContextMenuConfig } from './src/hooks/useContextMenu'
export { default as useUserStore } from './src/stores/user'
export { registerActions, defineAction, registerPreCondition, useAction, type ActionItem } from './src/hooks/useAction'
export {default  as Action} from './src/widgets/action'
export { default as emitter } from './src/utils/emitter'

// 封装的通用选择器组件
export { default as useCommonSelector, CommonSelectorPropsDefine } from './src/hooks/useCommonSelector'

export { useMapCenter } from './src/hooks/useMapCenter'

// 动作选择器
export { useActionSelector } from './src/hooks/useAction'

// 路由管理
export { default as router, defineRoute, type IRoute, registerRoutes } from './src/router'

// 部分请求
export { requestUploadFile } from './src/api/uploadImage'
export { default as useRequestErrorMessage, useResponseMessage } from './src/hooks/useRequestErrorMessage'

// 路由/Meta相关常量与Hook
export * from './src/constants'

// 状态管理
export { default as useAppStore, openSettings, closeSettings, initApp } from './src/stores/app'

// 系统页面
export {default as AccountTable} from './src/views/account'
export {default as ShopTable} from './src/views/shop'
export {default as LoginPage} from './src/views/login'
export { default as useG6Graph } from './src/components/g6'
export { default as useECharts, createEChartsWidget } from './src/components/echarts'
export { default as Card } from './src/components/card'
