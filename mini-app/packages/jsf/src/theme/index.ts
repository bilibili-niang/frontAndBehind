import { inject, shallowRef, type Ref } from 'vue'
import defaultTheme from './default'
import standardTheme from './standard'
import type { Theme } from '../types/theme'
import type { WidgetComponentDefine } from '../types/widget'
import { BUILT_IN_THEME_COMPACT, BUILT_IN_THEME_STANDARD } from '../constants'

export const themeContexts: Record<string, Ref<Theme>> = {}

export const SCHEMA_FORM_THEME = Symbol()

/** 未找到的主题 */
const undefinedTheme = shallowRef<Theme>({
  name: 'undefined',
  widgets: {},
  presetSchema: {},
  pureWidgets: []
})

// 注册主题
export const registerTheme = (name: string, theme: Theme) => {
  themeContexts[name] = shallowRef(theme)
}

// 注册组件
export const registerWidget = (
  name: string | Record<string, WidgetComponentDefine>,
  widget?: WidgetComponentDefine,
  theme?: 'standard' | 'compact'
) => {
  if (typeof name === 'object') {
    Object.keys(name).forEach((key) => {
      themeContexts['standard'].value.widgets[key] = name[key]
      themeContexts['compact'].value.widgets[key] = name[key]
    })
    return void 0
  }
  if (themeContexts[theme ?? 'standard'].value.widgets[name]) {
    console.warn(`控件：${name} 已被覆盖`)
  }
  if (theme === 'standard' || theme === 'compact') {
    themeContexts[theme].value.widgets[name] = widget!
  } else {
    themeContexts['standard'].value.widgets[name] = widget!
    themeContexts['compact'].value.widgets[name] = widget!
  }
}

registerTheme(BUILT_IN_THEME_STANDARD, standardTheme)
registerTheme(BUILT_IN_THEME_COMPACT, defaultTheme)

export const useThemeContext = () => {
  // 兜底：若未注入主题（例如在某些弹窗或独立上下文中使用了控件），默认使用紧凑主题
  const fallbackThemeName = BUILT_IN_THEME_COMPACT
  const themeRef = inject(SCHEMA_FORM_THEME, shallowRef(fallbackThemeName)) as Ref<string | Theme>
  const themeContext =
    typeof themeRef.value === 'string'
      ? themeContexts[themeRef.value] ?? themeContexts[fallbackThemeName]
      : (themeRef as Ref<Theme>)
  if (!themeContext?.value) {
    console.error(`找不到 ${String((themeRef as any)?.value)} 主题定义`)
    return themeContexts[fallbackThemeName] ?? undefinedTheme
  }
  return themeContext
}
