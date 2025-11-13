import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './styles/common.scss'
import './styles/theme.scss'
import './styles/tailwindcss.css'
import antd from '@/plugins/index'
import App from './App'
import router from './router'
import './setup'
import { useAuthStore } from '@/store/auth'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// 显式从本地初始化登录态（若有）
useAuthStore().initFromLocal()

app.use(router)
app.use(antd)
// 已移除 notify 安装，改用 message.*
const vm = app.mount('#app')

// 标记应用已挂载，用于隐藏 index.html 中的 #app-loading
// 使用 rAF 确保样式与 DOM 更新后再标记；并提供定时兜底
requestAnimationFrame(() => {
  const el = document.getElementById('app')
  if (el && !el.hasAttribute('data-mounted')) {
    el.setAttribute('data-mounted', '')
  }
})
setTimeout(() => {
  const el = document.getElementById('app')
  if (el && !el.hasAttribute('data-mounted')) {
    el.setAttribute('data-mounted', '')
  }
}, 3000)
