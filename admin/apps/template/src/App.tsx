import { BaseApp, router } from '@anteng/core'
import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'
import '@anteng/styles'
import './app.scss'
import { initTheme } from '@/composables/theme'
import './styles/tailwindcss.css'
import './styles/common.scss'

export default defineComponent({
  name: 'App',
  setup() {
    // 初始化主题（优先本地存储；否则跟随系统偏好）
    initTheme()

    // 已移除滚动条增强逻辑，无需在挂载或路由切换后触发任何操作

    return () => (
      <BaseApp>
        <RouterView/>
      </BaseApp>
    )
  }
})
