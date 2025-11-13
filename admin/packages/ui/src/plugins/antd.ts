import type { App } from 'vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import '../styles/antd-theme.scss'

export default {
  install(app: App) {
    app.use(Antd)
  },
}