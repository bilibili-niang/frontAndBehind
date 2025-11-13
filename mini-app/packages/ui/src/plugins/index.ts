import type { App } from 'vue'
import AntdPlugin from './antd'

export function registerPlugins(app: App) {
  app.use(AntdPlugin)
}
