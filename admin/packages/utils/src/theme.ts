import { PREFIX_CLS } from '@anteng/config'

export type ThemeMode = 'dark' | 'light'

const THEME_KEY = `${PREFIX_CLS}-theme-mode`
const PRIMARY_KEY = `${PREFIX_CLS}-theme-primary-color`
const LEGACY_THEME_KEY = 'theme'

export const getThemeMode = (): ThemeMode => {
  return (document.documentElement.getAttribute('theme') as ThemeMode) || 'light'
}

export const setThemeMode = (mode: ThemeMode) => {
  const root = document.documentElement
  // 标记切换中，避免过渡与动画导致闪烁
  root.setAttribute('data-theme-switching', 'true')
  root.setAttribute('theme', mode)
  localStorage.setItem(THEME_KEY, mode)
  dispatchThemeChange()
  // 下一帧移除标记，再保留少许延迟确保样式稳定
  requestAnimationFrame(() => {
    setTimeout(() => {
      root.removeAttribute('data-theme-switching')
    }, 180)
  })
}

export const getPrimaryColor = (): string => {
  return document.documentElement.getAttribute('primary-color') || 'blue'
}

export const setPrimaryColor = (key: string) => {
  const root = document.documentElement
  root.setAttribute('data-theme-switching', 'true')
  root.setAttribute('primary-color', key)
  localStorage.setItem(PRIMARY_KEY, key)
  dispatchThemeChange()
  requestAnimationFrame(() => {
    setTimeout(() => {
      root.removeAttribute('data-theme-switching')
    }, 120)
  })
}

export const initTheme = () => {
  const saved = (localStorage.getItem(THEME_KEY) || localStorage.getItem(LEGACY_THEME_KEY) || 'light') as ThemeMode
  document.documentElement.setAttribute('theme', saved)
  localStorage.setItem(THEME_KEY, saved)
  localStorage.removeItem(LEGACY_THEME_KEY)

  const savedPrimary = localStorage.getItem(PRIMARY_KEY)
  const initialPrimary = (savedPrimary || document.documentElement.getAttribute('primary-color') || 'blue') as string
  document.documentElement.setAttribute('primary-color', initialPrimary)

  dispatchThemeChange()
}

export const dispatchThemeChange = () => {
  window.dispatchEvent(new Event('theme-change'))
}