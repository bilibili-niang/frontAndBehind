
import { defineComponent } from 'vue'
import themeConfig from './theme.json'
import './color.scss'
import { PREFIX_CLS } from '@pkg/config'
import { message } from '@pkg/ui'

export default defineComponent({
  name: 'DevColors',
  setup() {
    const TAILWIND_PALETTES: Record<string, string[]> = {
      slate: ['#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b', '#0f172a'],
      gray: ['#f9fafb', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#4b5563', '#374151', '#1f2937', '#111827'],
      zinc: ['#fafafa', '#f4f4f5', '#e4e4e7', '#d4d4d8', '#a1a1aa', '#71717a', '#52525b', '#3f3f46', '#27272a', '#18181b']
    }

    return () => {
      return (
        <div class="dev-colors">
          <div style="margin-top: 36px;" class={`${PREFIX_CLS}-settings__sub-title`}>
            颜色（仅dev模式）
          </div>
          {Object.keys(themeConfig.primaryColors).map((key) => {
            return (
              <>
                <div style="font-size: 14px; font-weight: 500; margin-bottom: 12px;margin-top: 48px;">{key}</div>
                <div class="dev-colors__list">
                  {Object.keys((themeConfig.primaryColors as any)[key]).map((variable) => {
                    const cssVarName = `--anteng-${variable}`
                    const cssVarRef = `var(${cssVarName})`
                    return (
                      <div
                        class="dev-colors__item clickable"
                        title={cssVarName}
                        style={{
                          backgroundColor: (themeConfig.primaryColors as any)[key][variable]
                        }}
                        onClick={() => {
                          navigator.clipboard.writeText(cssVarRef)
                          message.success(`已复制 ${cssVarName}`)
                        }}
                      >
                        <span class="dev-colors__tag">{variable.replace('color-primary-', '')}</span>
                      </div>
                    )
                  })}
                </div>
              </>
            )
          })}

          {/* 灰阶色盘（slate/gray/zinc） */}
          {Object.keys(TAILWIND_PALETTES).map((k) => (
            <>
              <div style="font-size: 14px; font-weight: 500; margin-bottom: 12px;margin-top: 48px;">{k}</div>
              <div class="dev-colors__list">
                {TAILWIND_PALETTES[k].map((hex, idx) => (
                  <div
                    class="dev-colors__item clickable"
                    title={`${k}-${idx}`}
                    style={{ backgroundColor: hex }}
                    onClick={() => {
                      navigator.clipboard.writeText(hex)
                      message.success(`已复制 ${k}-${idx}: ${hex}`)
                    }}
                  >
                    <span class="dev-colors__tag">{idx}</span>
                  </div>
                ))}
              </div>
            </>
          ))}
        </div>
      )
    }
  }
})
