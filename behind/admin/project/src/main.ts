import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './styles/common.scss'
import './styles/theme.scss'
import './styles/tailwindcss.css'
import vuetify from '@/plugins/index'
import App from './App'
import router from './router'
import './setup'
import { installNotify } from '@pkg/ui'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(vuetify)
// 让 UI 包的 programmatic notify 继承 app 上下文（包含 Vuetify 注入）
installNotify(app)
app.mount('#app')