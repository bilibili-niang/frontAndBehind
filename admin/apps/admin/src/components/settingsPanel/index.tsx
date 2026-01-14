import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { message, ThemeSwitch } from '@pkg/ui'
import { colorThemes } from '@pkg/config'
import { applyTheme } from '@/composables/theme'
import { getPrimaryColor, setPrimaryColor } from '@pkg/utils'

export default defineComponent({
  name: 'SettingsPanel',
  setup() {
    const primaryColor = ref<string>(getPrimaryColor())
    const COLORS: { key: string, value: string, label: string }[] = colorThemes

    // 根据当前 DOM 属性初始化，确保弹窗打开时状态正确
    const isDark = ref(document.documentElement.getAttribute('theme') === 'dark')

    const onThemeToggle = (checked: boolean) => {
      const mode = checked ? 'dark' : 'light'
      applyTheme(mode)
      message.success(mode === 'dark' ? '已切换深色模式' : '已切换浅色模式')
    }

    // 监听全局主题变化事件，保证开关与实际主题同步
    const syncFromDom = () => {
      isDark.value = document.documentElement.getAttribute('theme') === 'dark'
    }
    onMounted(() => window.addEventListener('theme-change', syncFromDom))
    onBeforeUnmount(() => window.removeEventListener('theme-change', syncFromDom))

    const onApplyPrimary = (key: string) => {
      setPrimaryColor(key)
      primaryColor.value = key
      message.success('已切换主题主色')
    }

    return () => (
      <div class="settings-section">
        <div class="settings-title">外观</div>

        <div class="flex flex-row">
          <div class="settings-subtitle pr-3">主题模式</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>浅色</span>
            <ThemeSwitch
              size="small"
              checked={isDark.value}
              onChange={(checked: boolean) => {
                isDark.value = checked
                onThemeToggle(checked)
              }}
            />
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>深色</span>
          </div>
        </div>

        <div class="settings-subtitle">主题主色</div>
        <div class="color-grid">
          {COLORS.map(c => (
            <div
              key={c.key}
              class={{ 'color-chip': true, active: primaryColor.value === c.key }}
              style={{ backgroundColor: c.value }}
              title={c.label}
              onClick={() => onApplyPrimary(c.key)}
            />
          ))}
        </div>

        <div class="settings-subtitle">预览</div>
        <div class="text-demo">
          <span class="primary-pill">主色</span>
          <span class="text-base">主文字</span>
          <span class="text-secondary">次要文字</span>
          <span class="text-tertiary">三级文字</span>
          <span class="text-disabled">禁用文字</span>
        </div>
        <div class="palette-grid">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(i => (
            <div key={i} class="palette-swatch" style={{ backgroundColor: `var(--color-${i})` }}/>
          ))}
        </div>
      </div>
    )
  }
})