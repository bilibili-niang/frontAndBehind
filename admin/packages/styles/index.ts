import './src/normalized.css'
import './src/theme.scss'
import './src/base.scss'
import './src/cursor/index.scss'
import './src/icon-park.js'
// 全局滚动与滚动条样式
import './src/variables/scroller.scss'

// 原子类
import './src/atomic/text.scss'
import './src/atomic/layout.scss'
import './src/atomic/border-radius.scss'

export const toggleThemeMode = (mode?: 'dark' | 'light') => {
  // 统一读取命名空间键；不再读取/写入旧键，避免重复
  const saved = localStorage.getItem('ice-theme-mode') as 'dark' | 'light' | null
  const v = mode ?? saved ?? 'light'
  document.documentElement.setAttribute('theme', v)
  localStorage.setItem('ice-theme-mode', v)
  // 清理旧键（一次性），防止污染
  localStorage.removeItem('theme-mode')
  console.info('[styles] toggleThemeMode:', { modeArg: mode, saved, applied: v })
}

// 初始化时根据持久化值“应用”主题，不再进行无参切换
toggleThemeMode()
