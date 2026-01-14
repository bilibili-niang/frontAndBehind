import { ref } from 'vue'
import { getThemeMode, initTheme as initThemeUtil, setThemeMode } from '@pkg/utils'

export type ThemeMode = 'dark' | 'light'

// 当前主题（从 DOM attribute 读取）
export const currentTheme = ref<ThemeMode>(getThemeMode())

export const applyTheme = (mode: ThemeMode) => {
  setThemeMode(mode)
  currentTheme.value = mode
}

export const initTheme = () => {
  initThemeUtil()
  currentTheme.value = getThemeMode()
}