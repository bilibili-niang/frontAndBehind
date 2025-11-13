import { BaseApp } from '@anteng/core'
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
    '触发更新9';
    // 初始化主题（优先本地存储；否则跟随系统偏好）
    initTheme()
    return () => (
      <BaseApp>
        <RouterView/>
      </BaseApp>
    )
  }
})
